import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../../lib/store";
import { fetchTwitchStreamers } from "../../../../lib/fetchers/twitch";
import { fetchKickStreamers } from "../../../../lib/fetchers/kick";

import { isAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// Twitch "Slots" kategorisi; gerekirse env ile değiştirilebilir
const TWITCH_GAME_ID = process.env.TWITCH_GAME_ID || "498566";

function authorized(req) {
  if (isAdmin()) return true; // admin panelinden elle tetikleme
  if (!process.env.CRON_SECRET) return true; // lokal geliştirmede serbest
  const h = req.headers.get("authorization") || "";
  const q = new URL(req.url).searchParams.get("secret") || "";
  return h === `Bearer ${process.env.CRON_SECRET}` || q === process.env.CRON_SECRET;
}

export async function GET(req) {
  if (!authorized(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const db = await readDB();
  const casinoNames = db.casinos.map((c) => c.name);
  const kickSlugs = (db.kickChannels || []).map((k) => k.slug).filter(Boolean);
  const report = { twitch: null, kick: null };
  let auto = [];

  try {
    const tw = await fetchTwitchStreamers({ gameId: TWITCH_GAME_ID, maxStreams: 50 }, casinoNames);
    report.twitch = tw.ok ? `${tw.streamers.length} yayın` : tw.reason;
    auto = auto.concat(tw.streamers);
  } catch (e) {
    report.twitch = e.message;
  }

  try {
    const kc = await fetchKickStreamers({ channels: kickSlugs }, casinoNames);
    report.kick = kc.ok ? `${kc.streamers.length} kanal` : kc.reason;
    auto = auto.concat(kc.streamers);
  } catch (e) {
    report.kick = e.message;
  }

  // Elle eklenen kayıtları koru, otomatik olanları tazele
  const manual = db.streamers.filter((s) => s.source !== "auto");
  db.streamers = [...manual, ...auto].sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
  db.meta.streamerCount = db.streamers.length;
  await writeDB(db);

  return NextResponse.json({ ok: true, updated: auto.length, kept_manual: manual.length, report });
}
