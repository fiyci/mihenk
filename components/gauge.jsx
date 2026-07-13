/* Circus-tarzı veri süsleri: yarım-daire skor göstergesi, rank rozeti, zincir rozeti. Server-safe. */

// Yarım daire gauge — Mihenk Score
export function Gauge({ value = 0, size = 54 }) {
  const r = size / 2 - 5;
  const cx = size / 2, cy = size / 2 + 2;
  const circ = Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color = pct >= 80 ? "#22C55E" : pct >= 60 ? "#EAB308" : "#EF4444";
  return (
    <div className="inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        <path d={`M 5 ${cy} A ${r} ${r} 0 0 1 ${size - 5} ${cy}`} fill="none" stroke="#1D2521" strokeWidth="5" strokeLinecap="round" />
        <path d={`M 5 ${cy} A ${r} ${r} 0 0 1 ${size - 5} ${cy}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} />
      </svg>
      <span className="font-mono text-[11px] font-semibold -mt-3" style={{ color }}>{Math.round(pct)}%</span>
    </div>
  );
}

// Sıralama rozeti — 1 altın, 2 gümüş, 3 bronz
export function RankBadge({ rank }) {
  const styles =
    rank === 1 ? "border-gold text-gold shadow-[0_0_10px_-2px_rgba(234,179,8,.5)]" :
    rank === 2 ? "border-bone2 text-bone" :
    rank === 3 ? "border-orange-400 text-orange-400" :
    "border-edge text-mute";
  return (
    <span className={`w-8 h-8 shrink-0 grid place-items-center rounded-full border bg-ink font-mono text-xs font-semibold ${styles}`}>
      {rank}
    </span>
  );
}

// Zincir rozeti — TRX/ETH/SOL/BSC/BTC renk kodlu
const CHAIN_STYLES = {
  TRX: "bg-red-500/15 text-red-400",
  ETH: "bg-blue-500/15 text-blue-400",
  SOL: "bg-purple-500/15 text-purple-300",
  BSC: "bg-yellow-500/15 text-yellow-300",
  BTC: "bg-orange-500/15 text-orange-300"
};
export function ChainBadge({ chain }) {
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide ${CHAIN_STYLES[chain] || "bg-edge text-mute"}`}>
      {chain}
    </span>
  );
}
