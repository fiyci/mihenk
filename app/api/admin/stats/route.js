import { NextResponse } from "next/server";
import { readDB } from "../../../../lib/store";
import { isAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const db = await readDB();
  const pendingReviews = db.reviews.filter((r) => r.approved === false).length;
  const pendingStreamerReviews = (db.streamerReviews || []).filter((r) => r.approved === false).length;
  const liveStreamers = db.streamers.filter((s) => s.live).length;
  const autoStreamers = db.streamers.filter((s) => s.source === "auto").length;
  const totalVolume = db.transactions.reduce((s, t) => s + (t.amountUsd || 0), 0);
  const recentTx = [...db.transactions]
    .sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0))
    .slice(0, 6);

  return NextResponse.json({
    counts: {
      casinos: db.casinos.length,
      streamers: db.streamers.length,
      liveStreamers,
      autoStreamers,
      transactions: db.transactions.length,
      reviews: db.reviews.length,
      pendingReviews,
      pendingStreamerReviews,
      streamerReviews: (db.streamerReviews || []).length,
      wallets: (db.wallets || []).length,
      kickChannels: (db.kickChannels || []).length
    },
    totalVolume,
    recentTx,
    log: (db.activityLog || []).slice(0, 20)
  });
}
