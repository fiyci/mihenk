"use client";
import { useState } from "react";
import Link from "next/link";

function fmtUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}Mr`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export function CompareClient({ casinos, initial }) {
  const initSlugs = casinos.filter((c) => initial.includes(c.slug) || initial.includes(c.name.toLowerCase())).map((c) => c.slug);
  const [picked, setPicked] = useState(initSlugs.length ? initSlugs.slice(0, 3) : []);

  function toggle(slug) {
    setPicked((p) => {
      if (p.includes(slug)) return p.filter((x) => x !== slug);
      if (p.length >= 3) return [...p.slice(1), slug]; // max 3, en eskiyi at
      return [...p, slug];
    });
  }

  const cols = picked.map((slug) => casinos.find((c) => c.slug === slug)).filter(Boolean);

  // en iyi değeri vurgulamak için yardımcı
  function best(key, dir = "max") {
    if (!cols.length) return null;
    const vals = cols.map((c) => c[key]);
    return dir === "max" ? Math.max(...vals) : Math.min(...vals);
  }

  const rows = [
    { label: "7g hacim", key: "volume7d", fmt: fmtUsd, best: "max" },
    { label: "Pazar payı", key: "share7d", fmt: (v) => `${v}%`, best: "max" },
    { label: "7g yatırım adedi", key: "deposits7d", fmt: (v) => v.toLocaleString("tr-TR"), best: "max" },
    { label: "Güven skoru", key: "trustScore", fmt: (v) => v, best: "max" },
    { label: "Sentiment", key: "sentiment", fmt: (v) => v, best: "max" },
    { label: "Sıralama", key: "rank", fmt: (v) => (v ? `#${v}` : "—"), best: "min" },
    { label: "Bağlı yayıncı", key: "streamers", fmt: (v) => v, best: "max" }
  ];

  return (
    <div>
      {/* seçim */}
      <div className="panel p-4 mb-6">
        <div className="panel-title mb-3">Casino seç (en fazla 3)</div>
        <div className="flex flex-wrap gap-2">
          {casinos.map((c) => {
            const on = picked.includes(c.slug);
            return (
              <button key={c.slug} onClick={() => toggle(c.slug)}
                className={`text-sm rounded-md px-3 py-1.5 border transition ${on ? "bg-mint text-ink border-mint font-semibold" : "border-edge text-slate-300 hover:border-mint/50"}`}>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {cols.length < 2 ? (
        <div className="panel p-8 text-center text-mute text-sm">
          Karşılaştırmak için en az 2 casino seç.
        </div>
      ) : (
        <div className="panel p-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-edge">
                <th className="p-3 text-left text-xs font-mono uppercase text-mute">Metrik</th>
                {cols.map((c) => (
                  <th key={c.slug} className="p-3 text-right">
                    <Link href={`/casinos/${c.slug}`} className="text-slate-100 hover:text-mint transition font-semibold">{c.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {rows.map((r) => {
                const bestVal = best(r.key, r.best);
                return (
                  <tr key={r.key}>
                    <td className="p-3 text-mute font-mono text-xs">{r.label}</td>
                    {cols.map((c) => {
                      const isBest = cols.length > 1 && c[r.key] === bestVal && c[r.key] != null;
                      return (
                        <td key={c.slug} className={`p-3 text-right font-mono ${isBest ? "text-mint font-semibold" : "text-slate-300"}`}>
                          {r.fmt(c[r.key])}
                          {isBest && <span className="ml-1 text-[10px]">▲</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td className="p-3 text-mute font-mono text-xs">Zincirler</td>
                {cols.map((c) => (
                  <td key={c.slug} className="p-3 text-right">
                    <div className="flex gap-1 justify-end flex-wrap">
                      {c.chains.length ? c.chains.map((ch) => (
                        <span key={ch} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-edge text-mute">{ch}</span>
                      )) : <span className="text-mute">—</span>}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] font-mono text-mute mt-3">▲ her satırda en iyi değeri gösterir.</p>
        </div>
      )}
    </div>
  );
}
