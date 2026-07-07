import { fmtUsd } from "../lib/store";

// Basit, bağımlılıksız SVG alan grafiği. Zaman serisi verisini çizer.
export function AreaChart({ data, height = 120, color = "#2FBF8F", label }) {
  if (!data || data.length < 2) {
    return (
      <div className="text-xs text-mute font-mono py-8 text-center">
        Grafik için henüz yeterli veri yok — cron çalıştıkça (her turda bir snapshot) burası dolacak.
      </div>
    );
  }
  const w = 720;
  const h = height;
  const vals = data.map((d) => d.volume);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.volume - min) / range) * (h - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = `0,${h} ${pts.join(" ")} ${w},${h}`;
  const first = data[0];
  const last = data[data.length - 1];
  const change = first.volume ? ((last.volume - first.volume) / first.volume) * 100 : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        {label && <span className="panel-title">{label}</span>}
        <span className={`font-mono text-xs ${change >= 0 ? "text-mint" : "text-chip"}`}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="overflow-visible">
        <polygon points={area} fill={color} opacity="0.12" />
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between text-[10px] font-mono text-mute mt-1">
        <span>{new Date(first.ts).toLocaleDateString("tr-TR")}</span>
        <span className="text-gold">{fmtUsd(last.volume)}</span>
        <span>{new Date(last.ts).toLocaleDateString("tr-TR")}</span>
      </div>
    </div>
  );
}
