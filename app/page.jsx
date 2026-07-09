import { readDB, fmtUsd } from "../lib/store";
import { Ticker, Panel, CasinoRows, StreamerRows, Donut, TrustBadge } from "../components/ui";
import { AnimatedStat } from "../components/animated";
import { ExploreMenu } from "../components/exploreMenu";
import { movingCasinos } from "../lib/snapshot";
import { Reveal } from "../components/reveal";
import { TrendBadge } from "../components/trend";
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

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
        <div className="panel relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-felt/45 via-panel to-panel pointer-events-none" />
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gold/6 blur-3xl pointer-events-none" />

          {/* dateline şeridi — soruşturma yayını başlığı gibi */}
          <div className="relative flex items-center justify-between px-6 md:px-10 pt-6 text-[10px] font-mono uppercase tracking-[.18em] text-mute rise rise-1">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot inline-block" />
              Canlı istihbarat
            </span>
            <span>{new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })} · UTC</span>
          </div>
          <div className="relative mx-6 md:mx-10 mt-4 h-px bg-edge rise rise-1" />

          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 p-6 md:p-10 pt-7">
            {/* sol: editoryal manşet */}
            <div>
              <h1 className="display-xl text-[2.2rem] sm:text-5xl md:text-[4.2rem] text-bone rise rise-2">
                Para nereye<br />akıyor, <span className="italic text-gold" style={{ fontWeight: 400 }}>izliyoruz</span>.
              </h1>
              <p className="mt-6 text-bone2 max-w-lg leading-relaxed text-[15px] rise rise-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                On-chain yatırım akışını, canlı yayıncı aktivitesini ve topluluk güvenini
                tek bir bağımsız terminalden izleyen istihbarat servisi. Reklam yok, yönlendirme yok —
                yalnızca veri.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-7 text-[11px] font-mono text-mute rise rise-3">
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-mint" /> 5 dakikada bir güncellenir</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gold" /> on-chain · topluluk · Twitch/Kick</span>
              </div>
            </div>

            {/* sağ: forensic okuma tablosu */}
            <div className="lg:border-l lg:border-edge lg:pl-10 lg:pt-0 pt-6 border-t border-edge lg:border-t-0 flex flex-col justify-center rise rise-4">
              <div className="eyebrow text-mute mb-1">7 günlük izlenen hacim</div>
              <div className="stat-num text-4xl md:text-5xl text-gold mb-5">
                <AnimatedStat inline numeric={db.meta.totalVolume7d} format="usd" />
              </div>
              <dl className="space-y-0 font-mono text-sm">
                <div className="flex items-center justify-between py-2.5 border-t border-edge">
                  <dt className="text-mute text-xs uppercase tracking-wider">Casino izleniyor</dt>
                  <dd className="text-bone tabular-nums"><AnimatedStat inline numeric={db.meta.casinoCount} format="tr" /></dd>
                </div>
                <div className="flex items-center justify-between py-2.5 border-t border-edge">
                  <dt className="text-mute text-xs uppercase tracking-wider">Yayıncı takipte</dt>
                  <dd className="text-bone tabular-nums"><AnimatedStat inline numeric={db.meta.streamerCount} format="tr" /></dd>
                </div>
                <div className="flex items-center justify-between py-2.5 border-t border-edge">
                  <dt className="text-mute text-xs uppercase tracking-wider">Zirvedeki casino</dt>
                  <dd className="text-mint">{topCasinos[0]?.name || "—"}</dd>
                </div>
              </dl>
            </div>
          </div>
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
            <span className="text-bone2">{fmtUsd(walletTotal)}</span>
          </div>
        </Panel>

        <Panel title="Günün en büyükleri" action={{ href: "/blockchain", label: "Tümü" }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-mono text-mint mb-2">En büyük yatırımlar</div>
              <ol className="space-y-1.5">
                {deposits.slice(0, 5).map((t, i) => (
                  <li key={t.id} className="flex justify-between font-mono text-xs">
                    <span className="text-bone2">{i + 1} {t.casino} <span className="text-mute">{t.chain}</span></span>
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
                    <span className="text-bone2">{i + 1} {t.casino} <span className="text-mute">{t.chain}</span></span>
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
                <span className="text-sm text-bone2 truncate">{m.name}</span>
                <span className="text-xs shrink-0 ml-2"><TrendBadge change={m.change} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-10">
        <Reveal>
        <div className="panel p-6 md:p-10 bg-gradient-to-br from-felt/40 to-panel overflow-hidden relative">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-mint/10 blur-3xl pointer-events-none" />
          <p className="eyebrow mb-3">B2B · Operatörler için</p>
          <h3 className="text-3xl md:text-4xl text-bone max-w-xl display-xl">Rakiplerinizi <span className="italic text-gold" style={{ fontWeight: 400 }}>tek panelden</span> izleyin</h3>
          <p className="text-bone2 text-[15px] mt-4 max-w-2xl leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Bir site işletiyorsanız rakip analitiği, yayıncı istihbaratı ve zincir üstü hacim takibiyle sektörün en gelişmiş verilerine erişin.
          </p>
          <ul className="grid md:grid-cols-3 gap-2 mt-5 text-xs font-mono text-mint">
            <li>· Gerçek zamanlı blockchain takibi</li>
            <li>· Yayıncı analitiği</li>
            <li>· Yayıncı uyumluluk izleme</li>
            <li>· Casinolar arası whale takibi</li>
            <li>· Yayıncı iş birliği geçmişi</li>
            <li>· Rakip karşılaştırma</li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/for-operators" className="btn-mint text-sm rounded-lg px-5 py-2.5">
              Paketleri gör
            </Link>
            <Link href="/operator" className="border border-edge text-bone2 text-sm rounded-lg px-5 py-2.5 hover:border-mint/50 transition">
              Demo panele git
            </Link>
          </div>
        </div>
        </Reveal>
      </section>
    </div>
  );
}
