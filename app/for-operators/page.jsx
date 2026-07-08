import { BRAND } from "../../lib/brand";
import Link from "next/link";

export const metadata = {
  title: `Operatörler için — ${BRAND.name}`,
  description: "Rakiplerinizi, yayıncılarınızı ve zincir üstü hacmi tek panelden izleyin. iGaming operatörleri için pazar istihbaratı."
};

const features = [
  { title: "Rakip takibi", desc: "Rakip casinoların hacim, pazar payı ve trend değişimini gerçek zamanlı izleyin." },
  { title: "Yayıncı istihbaratı", desc: "Hangi yayıncı hangi casinoyu tanıtıyor, izleyici trendi nasıl — creator fit skorlarıyla." },
  { title: "Zincir üstü izleme", desc: "Rakiplerin yatırım/çekim akışını on-chain takip edin, whale hareketlerini yakalayın." },
  { title: "Sentiment & güven", desc: "Topluluk yorumları ve güven skorlarını kaynak kırılımıyla görün." },
  { title: "Uyarılar", desc: "Rakip hamlesi, ani hacim değişimi veya olumsuz sentiment sıçraması olduğunda bildirim." },
  { title: "API erişimi", desc: "Tüm veriyi kendi sistemlerinize entegre edin (Enterprise)." }
];

const plans = [
  { name: "Public", price: "Ücretsiz", features: ["Herkese açık dashboard", "Temel casino & yayıncı listeleri", "Sınırlı geçmiş"], cta: "Şimdi keşfet", href: "/" },
  { name: "Pro", price: "Teklif al", featured: true, features: ["Rakip karşılaştırma", "Detaylı metrikler & ısı haritaları", "Yayıncı istihbaratı", "E-posta uyarıları"], cta: "Demo iste", href: "/operator" },
  { name: "Enterprise", price: "Teklif al", features: ["Tüm Pro özellikleri", "API erişimi", "Özel raporlar", "Öncelikli destek"], cta: "İletişime geç", href: "/operator" }
];

export default function ForOperators() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-block text-[10px] font-mono uppercase tracking-wider text-mint border border-mint/40 rounded-full px-3 py-1 mb-4">
          B2B · Operatörler için
        </div>
        <h1 className="text-4xl font-bold text-slate-50 leading-tight">
          Rakiplerinizi, yayıncılarınızı ve zincir üstü hacmi tek panelden izleyin
        </h1>
        <p className="text-mute mt-4">
          {BRAND.name}, iGaming operatörleri için bağımsız bir pazar istihbaratı platformudur. Karar verirken
          tahmine değil veriye dayanın.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/operator" className="bg-mint text-ink font-semibold text-sm rounded-lg px-5 py-2.5 hover:opacity-90 transition">
            Demo paneli gör
          </Link>
          <a href={`mailto:${BRAND.email}`} className="border border-edge text-slate-200 text-sm rounded-lg px-5 py-2.5 hover:border-mint/50 transition">
            Teklif iste
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-14">
        {features.map((f) => (
          <div key={f.title} className="panel p-5">
            <h3 className="font-semibold text-slate-100">{f.title}</h3>
            <p className="text-sm text-mute mt-2">{f.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-slate-50 text-center mt-16 mb-8">Paketler</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.name} className={`panel p-6 flex flex-col ${p.featured ? "border-mint/50 relative" : ""}`}>
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mint text-ink text-[10px] font-mono uppercase tracking-wider rounded-full px-3 py-1">
                En popüler
              </span>
            )}
            <div className="font-semibold text-slate-100">{p.name}</div>
            <div className="font-mono text-2xl text-gold mt-1">{p.price}</div>
            <ul className="space-y-2 mt-4 flex-1">
              {p.features.map((feat) => (
                <li key={feat} className="text-sm text-mute flex items-start gap-2">
                  <span className="text-mint mt-0.5">✓</span> {feat}
                </li>
              ))}
            </ul>
            <Link href={p.href} className={`mt-6 text-center text-sm rounded-lg py-2.5 transition ${p.featured ? "bg-mint text-ink font-semibold hover:opacity-90" : "border border-edge text-slate-200 hover:border-mint/50"}`}>
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-[11px] font-mono text-mute text-center mt-10 max-w-xl mx-auto">
        Veriler yalnızca bilgilendirme ve analiz amaçlıdır; bahis, yatırım veya finansal tavsiye değildir.
        {BRAND.name} bir bahis sitesi değildir ve kumar hizmeti sunmaz.
      </p>
    </div>
  );
}
