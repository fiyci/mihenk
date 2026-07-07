import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../../lib/store";
import { moderateReview } from "../../../../lib/moderate";

export const dynamic = "force-dynamic";

function clean(str, max) { return String(str || "").trim().slice(0, max); }

function recomputeStreamerRating(db, handle) {
  const rs = db.streamerReviews.filter((r) => r.streamer === handle && r.approved !== false);
  const s = db.streamers.find((x) => x.handle === handle);
  if (!s) return;
  s.reviewCount = rs.length;
  s.rating = rs.length ? Math.round((rs.reduce((a, r) => a + r.rating, 0) / rs.length) * 10) / 10 : 0;
}

export async function POST(req) {
  const body = await req.json();
  const streamer = clean(body.streamer, 60);
  const author = clean(body.author, 40) || "anonim";
  const text = clean(body.text, 600);
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 0));

  if (!streamer || !text || !rating) return NextResponse.json({ error: "Yayıncı, puan ve yorum zorunludur." }, { status: 400 });
  if (text.length < 10) return NextResponse.json({ error: "Yorum en az 10 karakter olmalı." }, { status: 400 });

  const db = await readDB();
  if (!db.streamers.some((s) => s.handle === streamer)) {
    return NextResponse.json({ error: "Geçersiz yayıncı." }, { status: 400 });
  }

  // AI moderasyon (casino ile aynı mantık; "casino" alanı yerine yayıncı adı geçilir)
  const mod = await moderateReview({ casino: streamer, text, rating });
  if (!mod.ok) return NextResponse.json({ error: `Yorum yayınlanamadı: ${mod.reason}` }, { status: 400 });

  const review = {
    id: `sr${Date.now()}`,
    streamer, author, rating, text,
    approved: mod.autoApprove,
    modReason: mod.reason,
    helpful: 0, notHelpful: 0,
    ts: new Date().toISOString()
  };
  if (!db.streamerReviews) db.streamerReviews = [];
  db.streamerReviews.unshift(review);
  if (mod.autoApprove) recomputeStreamerRating(db, streamer);
  await writeDB(db);

  return NextResponse.json({
    ok: true,
    message: mod.autoApprove ? "Yorumun yayınlandı, teşekkürler!" : "Yorumun alındı, moderasyon sonrası yayınlanacak."
  }, { status: 201 });
}
