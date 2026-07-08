import { readDB, fmtUsd } from "../lib/store";
import { Ticker, Panel, CasinoRows, StreamerRows, Donut, TrustBadge } from "../components/ui";
import { AnimatedStat } from "../components/animated";
import { ExploreMenu } from "../components/exploreMenu";
import { movingCasinos } from "../lib/snapshot";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await readDB();
  const deposits = db.transactions.filter((t) => t.type === "deposit").sort((a, b) => b.amountUsd - a.amountUsd);
  const withdrawals = db.transactions.filter((t) => t.type === "withdrawal").sort((a, b) => b.amountUsd - a.amountUsd);
  const topCasinos = [...db.casinos].sort((a, b) => b.volume7d - a.volume7d);
  const liveStreamers = db.streamers.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
  const wallets = [...db.hotWallets].sort((a, b) => b.balanceUsd - a.balanceUsd);
  const walletTotal = wallets.reduce((s, w) => s + w.balanceUsd, 0);
  // yükselen/düşen casinolar; snapshot yoksa share7d'den yaklaşık türet
  let moving = movingCasinos(db, 6);
  if (!moving.length) {
    moving = [...db.casinos]
      .map((c) => ({ name: c.name, change: Math.round((c.sentiment - 50) / 2), now: c.volume7d }))
      .filter((m) => m.change !== 0)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 6);
  }

  return (
    <div>
      <Ticker transactions={db.transactions} />

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <p className="font-mono text-xs text-mint uppercase tracking-widest mb-3">Canlı veri · Bu hafta</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
          iGaming için <span className="text-mint">istihbarat</span>
        </h1>
        <p className="mt-3 text-mute max-w-2xl">
          Bu hafta {db.meta.casinoCount} casino ve {db.meta.streamerCount.toLocaleString("tr-TR")} yayıncı üzerinden{" "}
          <span className="text-gold font-mono">{fmtUsd(db.meta.totalVolume7d)}</span> hacim takip ediliyor.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1.5 border border-edge rounded-full px-2.5 py-1 text-mute">
            <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot" /> Otomatik güncellenir · her 5 dk
          </span>
          <span className="border border-edge rounded-full px-2.5 py-1 text-mute">Kaynak: on-chain + topluluk + Twitch/Kick</span>
          <span className="border border-edge rounded-full px-2.5 py-1 text-mute">Yalnızca bilgilendirme amaçlıdır</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <AnimatedStat label="Casinolar · canlı" numeric={db.meta.casinoCount} format="tr" delay={1} />
          <AnimatedStat label="Yayıncılar · takipte" numeric={db.meta.streamerCount} format="tr" delay={2} />
          <AnimatedStat label="Yatırımlar · 7g" numeric={db.meta.totalVolume7d} format="usd" accent="text-gold" delay={3} />
          <AnimatedStat label="Zirvedeki casino · 7g" value={topCasinos[0]?.name || "—"} accent="text-mint" delay={4} />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 flex gap-6">
        <ExploreMenu />
        <section className="flex-1 grid md:grid-cols-2 gap-4 min-w-0">
          <Panel title="7g hacme göre casinolar" action={{ href: "/casinos", label: "Tümü" }}>
            <CasinoRows casinos={topCasinos} limit={5} />
        </Panel>

        <Panel title="Canlı kumar yayıncıları" action={{ href: "/streamers", label: "Tümü" }}>
          <StreamerRows streamers={liveStreamers} limit={4} />
        </Panel>

        <Panel title="Pazar payı (7g)" action={{ href: "/blockchain", label: "Aktivite" }}>
          <Donut casinos={topCasinos} total={db.meta.totalVolume7d} />
        </Panel>

        <Panel title="Sıcak cüzdanlar · İlk 5" action={{ href: "/blockchain", label: "Tümü" }}>
          <ol className="divide-y divide-edge">
            {wallets.map((w, i) => (
              <li key={w.id} className="flex items-center gap-3 py-2">
                <span className="font-mono text-xs text-mute w-4">{i + 1}</span>
                <span className="flex-1 text-sm">{w.casino}</span>
                <span className="font-mono text-sm text-gold">{fmtUsd(w.balanceUsd)}</span>
              </li>
            ))}
          </ol>
          <div className="flex justify-between text-xs font-mono text-mute pt-1 border-t border-edge">
            <span>İlk 5 toplam</span>
            <span className="text-slate-200">{fmtUsd(walletTotal)}</span>
          </div>
        </Panel>

        <Panel title="Günün en büyükleri" action={{ href: "/blockchain", label: "Tümü" }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-mono text-mint mb-2">En büyük yatırımlar</div>
              <ol className="space-y-1.5">
                {deposits.slice(0, 5).map((t, i) => (
                  <li key={t.id} className="flex justify-between font-mono text-xs">
                    <span className="text-slate-300">{i + 1} {t.casino} <span className="text-mute">{t.chain}</span></span>
                    <span className="text-gold">{fmtUsd(t.amountUsd)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="text-xs font-mono text-chip mb-2">En büyük çekimler</div>
              <ol className="space-y-1.5">
                {withdrawals.slice(0, 5).map((t, i) => (
                  <li key={t.id} className="flex justify-between font-mono text-xs">
                    <span className="text-slate-300">{i + 1} {t.casino} <span className="text-mute">{t.chain}</span></span>
                    <span className="text-gold">{fmtUsd(t.amountUsd)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Panel>

        <Panel title="Topluluk güven skorları" action={{ href: "/sentiment", label: "Rapor" }}>
          <ul className="divide-y divide-edge">
            {topCasinos.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span className="text-sm">{c.name}</span>
                <TrustBadge score={c.trustScore} />
              </li>
            ))}
          </ul>
        </Panel>
        </section>
      </div>

      <section className="max-w-6xl mx-auto px-4 mt-10">
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="panel-title">Hareketli casinolar · 7g değişim</h3>
            <Link href="/casinos" className="text-xs font-mono text-mint hover:underline">Tümü →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {moving.map((m) => (
              <Link key={m.name} href={`/casinos/${m.name.toLowerCase()}`}
                className="flex items-center justify-between bg-ink rounded-md px-3 py-2.5 row-hover">
                <span className="text-sm text-slate-200 truncate">{m.name}</span>
                <span className={`font-mono text-xs shrink-0 ml-2 ${m.change >= 0 ? "text-mint" : "text-chip"}`}>
                  {m.change >= 0 ? "▲" : "▼"} {Math.abs(m.change)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-10">
        <div className="panel p-6 md:p-8 bg-gradient-to-br from-felt/40 to-panel">
          <h3 className="text-xl font-bold text-slate-50">Site sahipleri için gelişmiş analitik</h3>
          <p className="text-mute text-sm mt-2 max-w-2xl">
            Bir site işletiyorsanız rakiplerinize karşı analitik avantaj ve sektörün en gelişmiş verilerine erişim için iletişime geçin.
          </p>
          <ul className="grid md:grid-cols-3 gap-2 mt-4 text-xs font-mono text-mint">
            <li>· Gerçek zamanlı blockchain takibi</li>
            <li>· Yayıncı analitiği</li>
            <li>· Yayıncı uyumluluk izleme</li>
            <li>· Casinolar arası whale takibi</li>
            <li>· Yayıncı iş birliği geçmişi</li>
            <li>· Rakip karşılaştırma</li>
          </ul>
          <Link href="/admin" className="inline-block mt-5 bg-mint text-ink font-semibold text-sm rounded-lg px-4 py-2 hover:opacity-90 transition">
            Demo panele git
          </Link>
        </div>
      </section>
    </div>
  );
}
