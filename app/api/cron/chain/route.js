import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../../lib/store";
import { fetchChainActivity } from "../../../../lib/fetchers/chain";
import { takeSnapshot } from "../../../../lib/snapshot";

import { isAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

function authorized(req) {
  if (isAdmin()) return true; // admin panelinden elle tetikleme
  if (!process.env.CRON_SECRET) return true;
  const h = req.headers.get("authorization") || "";
  const q = new URL(req.url).searchParams.get("secret") || "";
  return h === `Bearer ${process.env.CRON_SECRET}` || q === process.env.CRON_SECRET;
}

export async function GET(req) {
  if (!authorized(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const db = await readDB();
  const { txs, errors } = await fetchChainActivity(db.wallets || []);

  // Tekrarları ele (id bazlı), yenileri ekle, listeyi 200 kayıtla sınırla
  const existing = new Set(db.transactions.map((t) => t.id));
  const fresh = txs.filter((t) => !existing.has(t.id));
  db.transactions = [...fresh, ...db.transactions]
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))
    .slice(0, 200);

  // Son 7 günden casino hacimlerini yeniden hesapla (otomatik veri varsa)
  if (fresh.length) {
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const deposits7d = db.transactions.filter(
      (t) => t.type === "deposit" && new Date(t.ts).getTime() > weekAgo
    );
    const total = deposits7d.reduce((s, t) => s + t.amountUsd, 0);
    if (total > 0) {
      db.meta.totalVolume7d = total;
      for (const c of db.casinos) {
        const vol = deposits7d.filter((t) => t.casino === c.name).reduce((s, t) => s + t.amountUsd, 0);
        c.volume7d = vol;
        c.share7d = Number(((vol / total) * 100).toFixed(1));
        c.deposits7d = deposits7d.filter((t) => t.casino === c.name).length;
      }
    }
  }

  takeSnapshot(db);
  await writeDB(db);
  return NextResponse.json({ ok: true, new_txs: fresh.length, errors });
}
