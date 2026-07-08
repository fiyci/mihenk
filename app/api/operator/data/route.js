import { NextResponse } from "next/server";
import { readDB, fmtUsd, fmtViewers } from "../../../../lib/store";
import { isOperator } from "../../../../lib/auth";
import { movingCasinos } from "../../../../lib/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isOperator()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const db = await readDB();
  const casinos = [...db.casinos].sort((a, b) => b.volume7d - a.volume7d);
  const totalVol = casinos.reduce((s, c) => s + c.volume7d, 0);
  const moving = movingCasinos(db, 8);
  const movMap = new Map(moving.map((m) => [m.name, m.change]));

  // ilk casino'yu "siz" varsay (demo)
  const you = casinos[0];

  const overview = [
    { label: "Sizin 7g hacim", value: fmtUsd(you?.volume7d || 0), accent: "text-gold" },
    { label: "Pazar payı", value: `${totalVol ? Math.round((you.volume7d / totalVol) * 100) : 0}%`, sub: "sektör lideri", up: true },
    { label: "Güven skoru", value: you?.sentiment || "—", accent: "text-mint" },
    { label: "Takip edilen rakip", value: casinos.length - 1 }
  ];

  const competitors = casinos.slice(0, 8).map((c, i) => ({
    name: c.name,
    you: i === 0,
    volume: fmtUsd(c.volume7d),
    share: `${totalVol ? Math.round((c.volume7d / totalVol) * 100) : 0}%`,
    trust: c.sentiment,
    streamers: db.streamers.filter((s) => s.casino === c.name).length,
    change: movMap.get(c.name) ?? Math.round((c.sentiment - 50) / 3)
  }));

  const streamers = [...db.streamers]
    .sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
    .slice(0, 8)
    .map((s) => ({
      handle: s.handle,
      platform: s.platform,
      casino: s.casino || "—",
      viewers: s.live ? `${fmtViewers(s.viewers)} canlı` : "çevrimdışı",
      fit: 50 + ((s.handle.length * 7) % 50) // demo fit skoru
    }));

  const topMover = moving[0];
  const alerts = [
    topMover && { level: "high", text: `${topMover.name} son dönemde %${Math.abs(topMover.change)} ${topMover.change >= 0 ? "hacim artışı" : "hacim düşüşü"} gösterdi.`, time: "az önce" },
    { level: "med", text: `${db.streamers.filter((s) => s.live).length} yayıncı şu an canlı — rakip sponsorluklarını izleyin.`, time: "5 dk önce" },
    { level: "low", text: "Haftalık sentiment raporu hazır.", time: "1 saat önce" }
  ].filter(Boolean);

  const reports = [
    { title: "Haftalık Pazar Raporu", desc: "Tüm casinoların hacim, pay ve trend özeti." },
    { title: "Rakip Derinlik Analizi", desc: "Seçili rakiplerin cüzdan ve yayıncı kırılımı." },
    { title: "Yayıncı Due Diligence", desc: "Bir yayıncının sponsor geçmişi ve risk profili." },
    { title: "Sentiment Raporu", desc: "Kaynak bazlı güven skoru kırılımı." }
  ];

  return NextResponse.json({ overview, competitors, streamers, alerts, reports });
}
