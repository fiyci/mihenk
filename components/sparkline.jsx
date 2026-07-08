// Minik SVG sparkline — casino satırlarında trend göstergesi.
// Snapshot verisi varsa onu, yoksa isimden türetilmiş deterministik bir seri çizer
// (böylece veri birikene kadar da satır canlı görünür).

function seed(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h;
}

export function Sparkline({ name, series, width = 90, height = 28, up }) {
  let vals;
  if (series && series.length >= 2) {
    vals = series.map((s) => s.volume);
  } else {
    // deterministik yedek seri
    const s = seed(name || "x");
    vals = [];
    let v = 50 + (s % 30);
    for (let i = 0; i < 12; i++) {
      v = Math.max(10, v + (((s * 31 + i * 17) % 23) - 11));
      vals.push(v);
    }
  }
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const rising = up != null ? up : vals[vals.length - 1] >= vals[0];
  const color = rising ? "#2FBF8F" : "#E25C5C";
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = `0,${height} ${pts.join(" ")} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden="true">
      <polygon points={area} fill={color} opacity="0.1" />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="spark-draw"
      />
    </svg>
  );
}
