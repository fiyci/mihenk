"use client";
import { useEffect, useRef, useState } from "react";

// Sayı yukarı sayma animasyonu. Görünür olunca bir kez çalışır.
export function CountUp({ value, fmt, format, duration = 1100, className }) {
  const formatter = fmt || format;
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const from = 0;
        const to = Number(value) || 0;
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          setDisplay(from + (to - from) * eased);
          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(to);
        }
        // reduced motion: direkt sonuç
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
          setDisplay(to);
        } else {
          requestAnimationFrame(tick);
        }
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={ref} className={className}>{formatter ? formatter(display) : Math.round(display)}</span>;
}

// Animasyonlu istatistik kartı — count-up + giriş animasyonu.
// format: "usd" | "tr" | undefined (fonksiyon geçilmez; server→client kısıtı)
export function AnimatedStat({ label, value, numeric, format, accent, delay, inline }) {
  const fmt = format === "usd"
    ? (n) => {
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}Mr`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
        return `$${Math.round(n)}`;
      }
    : format === "tr"
    ? (n) => Math.round(n).toLocaleString("tr-TR")
    : null;

  if (inline) {
    return numeric != null ? <CountUp value={numeric} fmt={fmt} /> : value;
  }

  return (
    <div className={`panel p-4 rise rise-${delay || 1}`}>
      <div className="panel-title mb-2">{label}</div>
      <div className={`stat-num ${accent || ""}`}>
        {numeric != null ? <CountUp value={numeric} fmt={fmt} /> : value}
      </div>
    </div>
  );
}
