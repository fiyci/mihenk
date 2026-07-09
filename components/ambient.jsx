// Sabit ambient arka plan — "canlı istihbarat terminali" atmosferi.
// Izgara dokusu + yavaşça sürüklenen ışık lekeleri. Tamamen dekoratif,
// pointer-events yok, reduced-motion'da hareket durur.
export function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-glow g1" />
      <div className="ambient-glow g2" />
    </div>
  );
}
