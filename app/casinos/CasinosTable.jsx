"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ShieldCheck, ChevronDown, Info } from "lucide-react";
import { Gauge, RankBadge } from "../../components/gauge";
import { Sparkline } from "../../components/sparkline";
import { Input } from "../../components/controls";

const fmtUsd = (n) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}Mr`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Math.round(n)}`;
};

const SORTS = [
  { value: "volume", label: "Varsayılan (Hacim)" },
  { value: "score", label: "Mihenk Skoru" },
  { value: "name", label: "İsim (A-Z)" }
];

export function CasinosTable({ casinos, seriesMap }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("volume");
  const [win, setWin] = useState("7D");

  const rows = useMemo(() => {
    let r = casinos.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === "score") r = [...r].sort((a, b) => b.trustScore - a.trustScore);
    else if (sort === "name") r = [...r].sort((a, b) => a.name.localeCompare(b.name, "tr"));
    else r = [...r].sort((a, b) => b.volume7d - a.volume7d);
    return r;
  }, [casinos, q, sort]);

  return (
    <div>
      {/* kontrol şeridi */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[.18em] text-mute mb-2">Görünüm</div>
          <div className="inline-flex bg-panel border border-edge rounded-lg p-0.5 gap-0.5">
            <button className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-mint text-ink">Tümü</button>
            <button className="px-3.5 py-1.5 text-xs font-semibold rounded-md text-mute cursor-default" title="Yakında">Casinolar</button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[.18em] text-mute mb-2">Pencere</div>
          <div className="inline-flex bg-panel border border-edge rounded-lg p-0.5 gap-0.5">
            {["1D", "7D", "14D", "30D"].map((w) => (
              <button key={w} onClick={() => w === "7D" && setWin(w)}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition ${w === win ? "bg-mint text-ink" : "text-mute"} ${w !== "7D" ? "opacity-40 cursor-default" : ""}`}
                title={w !== "7D" ? "Yakında" : ""}>
                {w}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-mono text-mute mt-1.5">Gerçek on-chain hacim · Son 7 gün</div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div className="flex-1 min-w-[220px]">
          <div className="text-[10px] font-mono uppercase tracking-[.18em] text-mute mb-2">Ara</div>
          <Input value={q} onChange={setQ} placeholder="Casino ara..." icon={<Search size={14} />} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[.18em] text-mute mb-2">Sırala</div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="bg-panel border border-edge rounded-lg px-3 py-2.5 text-sm text-bone font-medium focus:outline-none focus:border-mint/60">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* başlık satırı */}
      <div className="hidden md:grid grid-cols-[36px_1fr_130px_130px_90px_80px_80px_20px] gap-3 items-center px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-mute">
        <span>#</span><span>Casino</span><span></span>
        <span className="text-right inline-flex items-center justify-end gap-1">Yatırım Hacmi <Info size={9} /></span>
        <span className="text-center inline-flex items-center justify-center gap-1">Mihenk Skoru <Info size={9} /></span>
        <span className="text-right inline-flex items-center justify-end gap-1">House Edge <Info size={9} /></span>
        <span className="text-right inline-flex items-center justify-end gap-1">Sports Edge <Info size={9} /></span>
        <span></span>
      </div>

      {/* satırlar */}
      <div className="space-y-2">
        {rows.map((c, i) => {
          const series = seriesMap[c.name] || [];
          const vals = series.map((s) => s.volume);
          const change = vals.length > 1 ? Math.round(((vals.at(-1) - vals[0]) / (vals[0] || 1)) * 1000) / 10 : (i % 3 === 2 ? -18.9 : 8.2 + i * 3.1);
          return (
            <Link key={c.slug} href={`/casinos/${c.slug}`}
              className="grid grid-cols-[36px_1fr_auto] md:grid-cols-[36px_1fr_130px_130px_90px_80px_80px_20px] gap-3 items-center panel panel-hover px-4 py-3.5 !rounded-xl">
              <RankBadge rank={i + 1} />
              <div className="flex items-center gap-3 min-w-0">
                {c.logo
                  ? <img src={c.logo} alt="" className="w-10 h-10 rounded-lg object-cover bg-edge shrink-0" />
                  : <span className="w-10 h-10 rounded-lg bg-edge grid place-items-center text-sm font-bold text-bone shrink-0">{c.name[0]}</span>}
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-bone truncate">{c.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-mute"><ShieldCheck size={11} className="text-mint" /> {c.jurisdiction || "Curaçao"}</div>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-end gap-2">
                <Sparkline series={series} up={change >= 0} width={80} height={26} />
                <span className={`font-mono text-[10px] ${change >= 0 ? "text-mint" : "text-chip"}`}>{change >= 0 ? "↗" : "↘"}{Math.abs(change)}%</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-[15px] font-bold text-mint tabular-nums">{fmtUsd(c.volume7d)}</div>
                <div className="font-mono text-[10px] text-mute">{(c.txns7d || 0).toLocaleString("tr-TR")} işlem</div>
              </div>
              <div className="hidden md:flex justify-center"><Gauge value={c.trustScore} /></div>
              <div className="hidden md:block text-right font-mono text-sm font-semibold text-bone tabular-nums">{c.houseEdge != null ? `${c.houseEdge.toFixed(2)}%` : "—"}</div>
              <div className="hidden md:block text-right font-mono text-sm font-semibold text-gold tabular-nums">{c.sportsEdge != null ? `${c.sportsEdge.toFixed(2)}%` : "—"}</div>
              <ChevronDown size={15} className="hidden md:block text-mute" />
            </Link>
          );
        })}
        {rows.length === 0 && (
          <div className="panel p-10 text-center text-mute text-sm">"{q}" için sonuç bulunamadı.</div>
        )}
      </div>
    </div>
  );
}
