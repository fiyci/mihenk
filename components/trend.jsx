import { TrendingUp, TrendingDown } from "lucide-react";

// Yüzde değişim rozeti — yön ikonlu, renk kodlu.
export function TrendBadge({ change, size = 13 }) {
  const up = change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-mono ${up ? "text-mint" : "text-chip"}`}>
      <Icon size={size} strokeWidth={2} />
      {Math.abs(change)}%
    </span>
  );
}
