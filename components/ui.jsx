import Link from "next/link";
import { fmtUsd, fmtViewers } from "../lib/store";
import { Sparkline } from "./sparkline";

export function Ticker({ transactions }) {
  const items = [...transactions, ...transactions];
  return (
    <div className="border-y border-edge bg-panel/60 overflow-hidden">
      <div className="ticker-track flex gap-10 whitespace-nowrap py-2 w-max">
        {items.map((t, i) => (
          <span key={i} className="font-mono text-xs flex items-center gap-2">
            <span className={t.type === "deposit" ? "text-mint" : "text-chip"}>
              {t.type === "deposit" ? "▲ YATIRIM" : "▼ ÇEKİM"}
            </span>
            <span className="text-bone2">{t.casino}</span>
            <span className="text-mute">{t.chain}</span>
            <span className="text-gold">{fmtUsd(t.amountUsd)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, accent }) {
  return (
    <div className="panel p-4">
      <div className="panel-title mb-2">{label}</div>
      <div className={`stat-num ${accent || ""}`}>{value}</div>
      {sub && <div className="text-xs text-mute mt-1 font-mono">{sub}</div>}
    </div>
  );
}

export function Panel({ title, action, children }) {
  return (
    <section className="panel panel-hover p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">{title}</h2>
        {action && (
          <Link href={action.href} className="text-xs text-mint font-mono link-underline">
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function CasinoRows({ casinos, limit }) {
  const rows = limit ? casinos.slice(0, limit) : casinos;
  return (
    <ol className="divide-y divide-edge">
      {rows.map((c, i) => (
        <li key={c.id} className="flex items-center gap-3 py-2.5 row-hover rounded-md px-1 -mx-1">
          <span className="font-mono text-xs text-mute w-4">{i + 1}</span>
          <span className="w-7 h-7 rounded-full bg-felt grid place-items-center text-mint text-xs font-bold overflow-hidden shrink-0">
            {c.logo ? <img src={c.logo} alt="" className="w-full h-full avatar" /> : c.name.slice(0, 2).toUpperCase()}
          </span>
          <Link href={`/casinos/${c.slug || c.name.toLowerCase()}`} className="flex-1 text-sm text-bone2 hover:text-mint transition min-w-0 truncate">
            {c.name}
          </Link>
          <Sparkline name={c.name} width={70} height={24} />
          <span className="font-mono text-xs text-mute w-12 text-right hidden sm:inline">{c.share7d}%</span>
          <span className="font-mono text-sm text-gold w-20 text-right">{fmtUsd(c.volume7d)}</span>
        </li>
      ))}
    </ol>
  );
}

export function StreamerRows({ streamers, limit }) {
  const rows = (limit ? streamers.slice(0, limit) : streamers).filter(Boolean);
  return (
    <ul className="divide-y divide-edge">
      {rows.map((s) => (
        <li key={s.id} className="py-2.5 flex items-center gap-3 row-hover rounded-md px-1 -mx-1">
          <span className={`relative w-9 h-9 rounded-full bg-felt grid place-items-center text-mint text-xs font-bold overflow-hidden shrink-0 avatar-ring ${s.live ? "live" : ""}`}>
            {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full avatar" /> : s.handle.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <Link href={`/streamers/${s.slug || s.handle.toLowerCase()}`} className="font-medium text-bone2 hover:text-mint transition truncate">{s.handle}</Link>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-edge text-mute shrink-0">{s.platform}</span>
              {s.casino && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-felt/60 text-mint shrink-0 hidden sm:inline">{s.casino}</span>}
              {s.rating > 0 && <span className="text-[10px] font-mono text-gold shrink-0">★ {s.rating}</span>}
            </div>
            <p className="text-xs text-mute truncate">{s.title}</p>
          </div>
          <span className="font-mono text-xs text-bone2 shrink-0 flex items-center gap-1.5">
            {s.live && <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot" />}
            {fmtViewers(s.viewers)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ casinos, total }) {
  const top = casinos.slice(0, 3);
  const colors = ["#2FBF8F", "#E8B84B", "#E25C5C"];
  let acc = 0;
  const segs = top.map((c, i) => {
    const seg = `${colors[i]} ${acc}% ${acc + c.share7d}%`;
    acc += c.share7d;
    return seg;
  });
  const bg = `conic-gradient(${segs.join(", ")}, #1E2635 ${acc}% 100%)`;
  return (
    <div className="flex items-center gap-5">
      <div className="relative w-28 h-28 rounded-full shrink-0" style={{ background: bg }}>
        <div className="absolute inset-3 rounded-full bg-panel grid place-items-center">
          <span className="font-mono text-[10px] text-mute text-center leading-tight">
            Toplam
            <br />
            <span className="text-bone text-xs">{fmtUsd(total)}</span>
          </span>
        </div>
      </div>
      <ul className="text-xs font-mono space-y-1.5">
        {top.map((c, i) => (
          <li key={c.id} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm" style={{ background: colors[i] }} />
            <span className="text-bone2">{c.name}</span>
            <span className="text-mute">{c.share7d}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrustBadge({ score }) {
  const color = score >= 80 ? "text-mint border-mint/40" : score >= 70 ? "text-gold border-gold/40" : "text-chip border-chip/40";
  return (
    <span className={`font-mono text-xs border rounded-md px-2 py-0.5 ${color}`}>{score}</span>
  );
}

// Tutarlı sayfa başlığı — eyebrow + karakterli display tipografi.
export function PageHeader({ eyebrow, title, subtitle, meta }) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[.18em] text-mute">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-mint inline-block" />
          {eyebrow || "MihenkScore"}
        </span>
        {meta && <span>{meta}</span>}
      </div>
      <div className="h-px bg-edge mt-3 mb-5" />
      <h1 className="display-xl text-3xl sm:text-4xl md:text-5xl text-bone">{title}</h1>
      {subtitle && <p className="text-bone2 text-[15px] mt-3 max-w-2xl leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{subtitle}</p>}
    </div>
  );
}
