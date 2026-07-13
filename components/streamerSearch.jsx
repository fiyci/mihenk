"use client";
import { useState } from "react";
import { Search, BarChart3, LineChart } from "lucide-react";

/* Circus-tarzı yayıncı arama şeridi: platform sekmeleri + tip filtreleri + arama. */
export function StreamerSearch({ counts = { kick: 0, twitch: 0 }, onFilter }) {
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");

  const apply = (p = platform, t = type, s = q) => onFilter?.({ platform: p, type: t, q: s });

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono uppercase tracking-[.18em] text-mute">Yayıncı Ara</div>
      <div className="flex flex-wrap gap-2">
        <div className="group relative flex items-center flex-1 min-w-[220px] bg-panel border border-edge rounded-lg transition-all focus-within:border-mint/60 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,.1)]">
          <span className="pl-3 text-mute group-focus-within:text-mint transition-colors"><Search size={14} /></span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); apply(platform, type, e.target.value); }}
            placeholder="Kick kullanıcı adı gir..."
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-bone placeholder:text-mute/60 focus:outline-none"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 bg-mint text-ink text-sm font-bold rounded-lg px-5 btn-mint">
          <Search size={14} strokeWidth={2.5} /> Ara
        </button>
        <button className="hidden sm:inline-flex items-center gap-1.5 border border-mint/40 text-mint text-sm font-semibold rounded-lg px-4 hover:bg-mint/10 transition">
          <BarChart3 size={14} /> Yayıncı İstatistikleri
        </button>
        <button className="hidden sm:inline-flex items-center gap-1.5 bg-mint/15 border border-mint/40 text-mint text-sm font-semibold rounded-lg px-4 hover:bg-mint/25 transition">
          <LineChart size={14} /> Analitik
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex border-b border-edge">
          {[
            { v: "all", label: "Tümü" },
            { v: "kick", label: `Kick`, count: counts.kick },
            { v: "twitch", label: `Twitch`, count: counts.twitch }
          ].map((p) => (
            <button key={p.v} onClick={() => { setPlatform(p.v); apply(p.v, type, q); }}
              className={`px-4 py-2 text-sm font-semibold transition border-b-2 -mb-px ${platform === p.v ? "text-mint border-mint" : "text-mute border-transparent hover:text-bone2"}`}>
              {p.label}{p.count != null && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-edge text-[10px] font-mono text-bone2">{p.count}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-mono text-mute">Tip:</span>
          {[
            { v: "all", label: "Tümü", cls: "border-mint/50 text-mint" },
            { v: "raw", label: "Ham (Gerçek Para)", cls: "border-mint/40 text-mint" },
            { v: "fixed", label: "Sabit (Sahte Para)", cls: "border-chip/40 text-chip" }
          ].map((t) => (
            <button key={t.v} onClick={() => { setType(t.v); apply(platform, t.v, q); }}
              className={`px-3 py-1 rounded-full border text-[11px] font-semibold transition ${type === t.v ? `${t.cls} bg-mint/5` : "border-edge text-mute hover:text-bone2"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
