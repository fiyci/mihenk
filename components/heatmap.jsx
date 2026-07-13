// Aktivite ısı haritası — gün × saat matrisinde canlı yayıncı yoğunluğu.
// Snapshot verisi yoksa "veri birikiyor" mesajı gösterir.

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function Heatmap({ grid, max, hasData }) {
  if (!hasData || max === 0) {
    return (
      <div className="text-xs text-mute font-mono py-8 text-center">
        Isı haritası için veri birikiyor — cron her turda bir snapshot alır, birkaç gün sonra gün/saat
        yoğunlukları burada belirir.
      </div>
    );
  }
  function color(v) {
    if (v === 0) return "rgba(30,38,53,.5)";
    const t = v / max;
    // koyu yeşilden parlak mint'e
    const a = 0.15 + t * 0.85;
    return `rgba(34,197,94,${a.toFixed(2)})`;
  }
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* saat başlıkları */}
        <div className="flex gap-0.5 mb-1 pl-8">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex-1 text-center text-[8px] font-mono text-mute">
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {grid.map((row, day) => (
          <div key={day} className="flex gap-0.5 items-center mb-0.5">
            <div className="w-8 text-[9px] font-mono text-mute">{DAYS[day]}</div>
            {row.map((v, h) => (
              <div
                key={h}
                className="flex-1 aspect-square rounded-[2px]"
                style={{ background: color(v) }}
                title={`${DAYS[day]} ${h}:00 — ort. ${v} canlı yayıncı`}
              />
            ))}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 justify-end text-[9px] font-mono text-mute">
          <span>az</span>
          <div className="flex gap-0.5">
            {[0.2, 0.4, 0.6, 0.8, 1].map((t) => (
              <div key={t} className="w-3 h-3 rounded-[2px]" style={{ background: `rgba(34,197,94,${t})` }} />
            ))}
          </div>
          <span>çok</span>
        </div>
      </div>
    </div>
  );
}
