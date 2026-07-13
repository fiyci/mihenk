import { readDB, fmtUsd, fmtViewers } from "../lib/store";
import { Ticker } from "../components/ui";
import { AnimatedStat } from "../components/animated";
import { ParticleCloud } from "../components/particles";
import { Gauge, RankBadge, ChainBadge } from "../components/gauge";
import { Sparkline } from "../components/sparkline";
import { Reveal } from "../components/reveal";
import { seriesForCasino } from "../lib/snapshot";
import { BRAND } from "../lib/brand";
import Link from "next/link";
import { Building2, Radio, DollarSign, Trophy, ArrowRight, ShieldCheck, Layers, Wallet, PieChart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await readDB();
  const topCasinos = [...db.casinos].sort((a, b) => b.volume7d - a.volume7d);
  const liveStreamers = [...db.streamers].sort((a, b) => (b.live - a.live) || (b.viewers - a.viewers)).slice(0, 4);
  const deposits = db.transactions.filter((t) => t.type === "deposit").sort((a, b) => b.amountUsd - a.amountUsd).slice(0, 5);
  const withdrawals = db.transactions.filter((t) => t.type === "withdrawal").sort((a, b) => b.amountUsd - a.amountUsd).slice(0, 5);
  const trustTop = [...db.casinos].sort((a, b) => b.trustScore - a.trustScore).slice(0, 3);
  const hotTop = [...(db.hotWallets || [])].sort((a, b) => (b.volumeUsd || 0) - (a.volumeUsd || 0)).slice(0, 5);
  const total = db.meta.totalVolume7d;
  const shareColors = ["#22C55E", "#3B82F6", "#EAB308", "#A855F7", "#EF4444"];

  return (
    <div>
      <Ticker transactions={db.transactions} />

      {/* ============ HERO — merkez parçacık bulutu ============ */}
      <section className="max-w-5xl mx-auto px-4 pt-8 md:pt-10 text-center">
        <div className="flex justify-center rise rise-1">
          <ParticleCloud size={210} />
        </div>
        <h1 className="display-xl text-4xl sm:text-6xl md:text-7xl text-bone -mt-4 rise rise-2">
          iGaming için <span className="text-mint">İstihbarat</span>
        </h1>
        <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-mute rise rise-3">
          <span className="w-2 h-2 rounded-full bg-mint pulse-dot inline-block" />
          Bu hafta <span className="font-mono font-semibold text-mint">{fmtUsd(total)}</span> hacim ·
          <span className="font-mono text-bone">{db.meta.casinoCount}</span> casino ·
          <span className="font-mono text-bone">{db.meta.streamerCount.toLocaleString("tr-TR")}</span> yayıncı izleniyor
        </p>

        {/* stat kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-left rise rise-3">
          {[
            { Icon: Building2, label: "Casinolar · Canlı", val: <AnimatedStat inline numeric={db.meta.casinoCount} format="tr" /> },
            { Icon: Radio, label: "Yayıncılar · Takipte", val: <AnimatedStat inline numeric={db.meta.streamerCount} format="tr" /> },
            { Icon: DollarSign, label: "Yatırımlar · 7g", val: <span className="text-mint"><AnimatedStat inline numeric={total} format="usd" /></span> },
            { Icon: Trophy, label: "Zirvedeki Casino · 7g", val: <span className="inline-flex items-center gap-2"><span className="w-5 h-5 rounded bg-edge grid place-items-center text-[9px] font-bold text-bone">{(topCasinos[0]?.name || "?")[0]}</span>{topCasinos[0]?.name || "—"}</span> }
          ].map(({ Icon, label, val }) => (
            <div key={label} className="panel px-4 py-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-mute mb-1.5">
                <Icon size={12} strokeWidth={1.75} /> {label}
              </div>
              <div className="font-mono text-xl md:text-2xl font-bold text-bone tabular-nums truncate">{val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ ANA GRID ============ */}
      <section className="max-w-5xl mx-auto px-4 mt-10 grid lg:grid-cols-2 gap-4">
        {/* Top Casinolar */}
        <Reveal>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-bone"><Layers size={15} className="text-mint" /> 7g Hacme Göre Casinolar</h2>
            <Link href="/casinos" className="text-xs text-mute hover:text-mint font-mono transition">Tümü →</Link>
          </div>
          <div className="space-y-1">
            {topCasinos.slice(0, 5).map((c, i) => {
              const series = seriesForCasino(db, c.name);
              const vals = series.map((s) => s.volume);
              const change = vals.length > 1 ? Math.round(((vals.at(-1) - vals[0]) / (vals[0] || 1)) * 1000) / 10 : (i % 2 ? -8.4 : 12.6);
              return (
                <Link key={c.slug} href={`/casinos/${c.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 row-hover">
                  <RankBadge rank={i + 1} />
                  {c.logo
                    ? <img src={c.logo} alt="" className="w-9 h-9 rounded-lg object-cover bg-edge" />
                    : <span className="w-9 h-9 rounded-lg bg-edge grid place-items-center text-xs font-bold text-bone">{c.name[0]}</span>}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-bone truncate">{c.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-mute"><ShieldCheck size={10} className="text-mint" /> {c.jurisdiction || "Curaçao"}</div>
                  </div>
                  <div className="hidden sm:block shrink-0"><Sparkline series={series} up={change >= 0} width={96} height={30} /></div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-bold text-mint tabular-nums">{fmtUsd(c.volume7d)}</div>
                    <div className={`font-mono text-[10px] ${change >= 0 ? "text-mint" : "text-chip"}`}>{change >= 0 ? "↗" : "↘"} {Math.abs(change)}%</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        </Reveal>

        {/* Canlı yayıncılar */}
        <Reveal delay={80}>
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-bone"><span className="w-2 h-2 rounded-full bg-chip pulse-dot" /> Canlı Kumar Yayıncıları</h2>
            <Link href="/streamers" className="text-xs text-mute hover:text-mint font-mono transition">Tümü →</Link>
          </div>
          <div className="space-y-1">
            {liveStreamers.map((s, i) => (
              <Link key={s.slug} href={`/streamers/${s.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 row-hover">
                <span className="font-mono text-xs text-mute w-4 shrink-0">{i + 1}</span>
                {s.avatar
                  ? <img src={s.avatar} alt="" className={`w-11 h-11 rounded-full object-cover avatar-ring ${s.live ? "live" : ""}`} />
                  : <span className={`w-11 h-11 rounded-full bg-edge grid place-items-center text-sm font-bold text-bone avatar-ring ${s.live ? "live" : ""}`}>{s.handle[0].toUpperCase()}</span>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-bone truncate">{s.handle}</span>
                    {s.casino && <span className="px-1.5 py-0.5 rounded bg-edge text-[9px] font-mono text-bone2 shrink-0">{s.casino}</span>}
                  </div>
                  <div className="text-[11px] text-mute truncate">{s.title || s.bio || "—"}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-bold text-bone tabular-nums">{fmtViewers(s.viewers)}</div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-mute">viewers</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      {/* ============ HOT WALLETS ============ */}
      {hotTop.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mt-4">
          <Reveal>
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-bone"><Wallet size={15} className="text-mint" /> Sıcak Cüzdanlar · Top 5</h2>
              <Link href="/blockchain" className="text-xs text-mute hover:text-mint font-mono transition">Tümü →</Link>
            </div>
            <div className="divide-y divide-edge">
              {hotTop.map((w, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <span className="font-mono text-xs text-mute w-4">{i + 1}</span>
                  <span className="text-sm font-semibold text-bone flex-1">{w.casino}</span>
                  {w.chain && <ChainBadge chain={w.chain} />}
                  <span className="font-mono text-sm font-bold text-mint tabular-nums">{fmtUsd(w.volumeUsd || 0)}</span>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </section>
      )}

      {/* ============ MARKET SHARE / BIGGEST TODAY / TRUST ============ */}
      <section className="max-w-5xl mx-auto px-4 mt-4 grid md:grid-cols-3 gap-4">
        <Reveal>
        <div className="panel p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-bone mb-4"><PieChart size={15} className="text-mint" /> Pazar Payı (7g)</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 rounded-full shrink-0"
              style={{ background: `conic-gradient(${topCasinos.slice(0, 4).map((c, i) => {
                const start = topCasinos.slice(0, i).reduce((s, x) => s + x.share7d, 0);
                return `${shareColors[i]} ${start}% ${start + c.share7d}%`;
              }).join(",")}, #1D2521 ${topCasinos.slice(0, 4).reduce((s, x) => s + x.share7d, 0)}% 100%)` }}>
              <div className="absolute inset-3 rounded-full bg-panel grid place-items-center">
                <div className="text-center">
                  <div className="text-[8px] font-mono uppercase text-mute">Toplam</div>
                  <div className="font-mono text-[11px] font-bold text-bone">{fmtUsd(total)}</div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs min-w-0">
              {topCasinos.slice(0, 4).map((c, i) => (
                <div key={c.slug} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: shareColors[i] }} />
                  <span className="text-bone2 truncate">{c.name}</span>
                  <span className="font-mono text-mute ml-auto">{c.share7d}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Reveal>

        <Reveal delay={60}>
        <div className="panel p-4">
          <h2 className="text-sm font-bold text-bone mb-3">Bugünün En Büyükleri</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-mute mb-2">↓ Yatırımlar</div>
              <div className="space-y-1.5">
                {deposits.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-bone truncate flex-1">{t.casino}</span>
                    <ChainBadge chain={t.chain} />
                    <span className="font-mono font-semibold text-mint tabular-nums">{fmtUsd(t.amountUsd)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-mute mb-2">↑ Çekimler</div>
              <div className="space-y-1.5">
                {withdrawals.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-bone truncate flex-1">{t.casino}</span>
                    <ChainBadge chain={t.chain} />
                    <span className="font-mono font-semibold text-chip tabular-nums">{fmtUsd(t.amountUsd)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </Reveal>

        <Reveal delay={120}>
        <div className="panel p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-bone mb-4"><ShieldCheck size={15} className="text-mint" /> Topluluk Güven Skorları</h2>
          <div className="space-y-3.5">
            {trustTop.map((c) => (
              <Link key={c.slug} href={`/casinos/${c.slug}`} className="block group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-bone group-hover:text-mint transition">{c.name}</span>
                  <span className="font-mono font-bold text-mint">{c.trustScore}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-edge overflow-hidden">
                  <div className="h-full rounded-full bg-mint shadow-[0_0_8px_rgba(34,197,94,.6)]" style={{ width: `${c.trustScore}%` }} />
                </div>
              </Link>
            ))}
          </div>
          <Link href="/sentiment" className="inline-block mt-4 text-xs font-mono text-mute hover:text-mint transition">Tam rapor →</Link>
        </div>
        </Reveal>
      </section>

      {/* ============ B2B ============ */}
      <section className="max-w-5xl mx-auto px-4 mt-4 mb-14">
        <Reveal>
        <div className="panel p-6 md:p-9 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-mint/6 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h3 className="text-xl md:text-2xl font-bold text-bone">Site Sahipleri için Gelişmiş Analitik</h3>
              <p className="text-bone2 text-sm mt-2 max-w-xl">
                Bir site işletiyorsanız, rakiplerinize karşı analitik avantaj ve sektörün en gelişmiş verilerine erişim için iletişime geçin.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Gerçek Zamanlı Blockchain Takibi", "Yayıncı Analitiği", "Yayıncı Uyumluluk İzleme", "Casinolar Arası Whale Takibi", "Yayıncı İş Birliği Geçmişi", "Rakip Karşılaştırma"].map((f) => (
                  <span key={f} className="border border-edge rounded-full px-3 py-1 text-[11px] text-bone2">{f}</span>
                ))}
              </div>
            </div>
            <Link href="/for-operators" aria-label="Operatörler için"
              className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-mint grid place-items-center text-ink hover:shadow-[0_0_28px_-4px_rgba(34,197,94,.8)] hover:scale-105 transition-all">
              <ArrowRight size={22} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
        </Reveal>
      </section>
    </div>
  );
}
