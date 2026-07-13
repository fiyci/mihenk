"use client";
import { useEffect, useRef } from "react";

/*
  Parçacık bulutu — circus tarzı merkez görsel.
  Saf canvas (kütüphanesiz): ~600 parçacık, 3B küre + iç hacim,
  Y-ekseni etrafında organik dönüş, derinliğe göre boyut/alfa,
  imleç paralaksı + yakın alanda itme. prefers-reduced-motion'da statik.
*/
export function ParticleCloud({ size = 240, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = size, H = size;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const N = 620;
    const pts = [];
    for (let i = 0; i < N; i++) {
      // yüzey + hacim karışımı: organik bulut
      let x = Math.random() * 2 - 1, y = Math.random() * 2 - 1, z = Math.random() * 2 - 1;
      const len = Math.hypot(x, y, z) || 1;
      const surface = i < N * 0.55;
      const r = surface ? 1 : Math.cbrt(Math.random()) * 0.92;
      x = (x / len) * r; y = (y / len) * r; z = (z / len) * r;
      pts.push({
        x, y, z,
        ph: Math.random() * Math.PI * 2,          // organik salınım fazı
        sp: 0.4 + Math.random() * 0.8,            // salınım hızı
        sz: surface ? 1.1 + Math.random() * 1.3 : 0.7 + Math.random() * 0.9,
        pip: Math.random() < 0.06                  // parlak "zar noktası"
      });
    }

    let mx = 0, my = 0, tmx = 0, tmy = 0;   // imleç (yumuşatılmış)
    let px = -999, py = -999;                // itme için piksel konumu
    let t = 0, raf = 0;

    const onMove = (e) => {
      const b = canvas.getBoundingClientRect();
      const cx = e.clientX - b.left, cy = e.clientY - b.top;
      px = cx; py = cy;
      tmx = (cx / b.width) * 2 - 1;
      tmy = (cy / b.height) * 2 - 1;
    };
    const onLeave = () => { tmx = 0; tmy = 0; px = -999; py = -999; };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const F = 3.2;                 // perspektif odak
    const R = size * 0.34;         // yansıtma yarıçapı
    const cxp = W / 2, cyp = H / 2;

    const frame = () => {
      t += 0.0045;
      mx += (tmx - mx) * 0.06;     // akıcı takip
      my += (tmy - my) * 0.06;

      ctx.clearRect(0, 0, W, H);
      const rotY = t * 0.9 + mx * 0.9;
      const rotX = Math.sin(t * 0.35) * 0.14 + my * 0.55;
      const cy1 = Math.cos(rotY), sy1 = Math.sin(rotY);
      const cx1 = Math.cos(rotX), sx1 = Math.sin(rotX);

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        // organik nefes: yarıçapta minik salınım
        const breathe = 1 + Math.sin(t * p.sp * 2 + p.ph) * 0.035;
        let x = p.x * breathe, y = p.y * breathe, z = p.z * breathe;
        // Y sonra X rotasyonu
        let x1 = x * cy1 + z * sy1, z1 = -x * sy1 + z * cy1;
        let y1 = y * cx1 - z1 * sx1, z2 = y * sx1 + z1 * cx1;

        const s = F / (F + z2);            // derinlik ölçeği
        let sx = cxp + x1 * R * s;
        let sy = cyp + y1 * R * s;

        // imleç itmesi (ekran uzayında)
        const dx = sx - px, dy = sy - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 2600) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / 51) * 10;
          sx += (dx / d) * f; sy += (dy / d) * f;
        }

        const depth = (z2 + 1.15) / 2.3;   // 0 yakın..1 uzak
        const a = 0.9 - depth * 0.65;
        const rad = p.sz * s * (p.pip ? 1.5 : 1);
        if (p.pip) {
          ctx.fillStyle = `rgba(74,222,128,${Math.min(1, a + 0.25)})`;
          ctx.shadowColor = "rgba(34,197,94,.9)";
          ctx.shadowBlur = 6;
        } else {
          const g = depth < 0.45 ? "34,197,94" : "20,83,45";
          ctx.fillStyle = `rgba(${g},${a})`;
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, 6.2832);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [size]);

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className={`select-none ${className}`}
      aria-hidden="true"
    />
  );
}
