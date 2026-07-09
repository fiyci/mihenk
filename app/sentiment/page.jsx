import { readDB } from "../../lib/store";
import { TrustBadge, PageHeader } from "../../components/ui";
import { ReviewForm, ReviewCard } from "../../components/reviews";
import { BRAND } from "../../lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Oyuncu Yorumları & Sentiment — ${BRAND.name}` };

export default async function Sentiment() {
  const db = await readDB();
  const casinos = [...db.casinos].sort((a, b) => b.sentiment - a.sentiment);
  const casinoNames = casinos.map((c) => c.name);
  const reviews = db.reviews
    .filter((r) => r.approved !== false)
    .sort((a, b) => (b.helpful || 0) - (a.helpful || 0));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <PageHeader
        eyebrow="Topluluk verisi"
        title="Oyuncu yorumları & sentiment"
        subtitle="Skorlar oyuncuların puan ve yorumlarından hesaplanır. Bir casinoda oynadıysan deneyimini paylaş — topluluk verisi herkesin daha iyi karar vermesini sağlar."
      />

      <section className="panel p-5 bg-gradient-to-br from-felt/30 to-panel">
        <h2 className="panel-title mb-1">MihenkScore Güven Skoru nasıl hesaplanır?</h2>
        <p className="text-xs text-mute mb-4">Skorumuz tek bir kaynağa değil, ağırlıklı bir formüle dayanır. Şeffaflık için kırılım:</p>
        <div className="space-y-2.5">
          {[
            { label: "Topluluk yorumları", weight: 35, color: "#2FBF8F" },
            { label: "Ödeme / çekim güvenilirliği", weight: 25, color: "#E8B84B" },
            { label: "On-chain hareket stabilitesi", weight: 20, color: "#5B9BD5" },
            { label: "Yayıncı güven sinyali", weight: 10, color: "#B98FE8" },
            { label: "Dış kaynak / manuel doğrulama", weight: 10, color: "#E25C5C" }
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="text-xs text-bone2 w-52 shrink-0">{f.label}</span>
              <div className="flex-1 bg-ink rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${f.weight * 2}%`, background: f.color }} />
              </div>
              <span className="font-mono text-xs text-mute w-10 text-right">%{f.weight}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] font-mono text-mute mt-4">
          Not: On-chain ve dış kaynak ağırlıkları, ilgili veri bağlandıkça devreye girer. Skorlar bilgilendirme amaçlıdır.
        </p>
      </section>

      <section className="panel p-4">
        <h2 className="panel-title mb-4">Topluluk sentiment skorları</h2>
        <ul className="space-y-3">
          {casinos.map((c) => {
            const count = db.reviews.filter((r) => r.casino === c.name && r.approved !== false).length;
            return (
              <li key={c.id} id={c.slug} className="flex items-center gap-3">
                <span className="w-28 text-sm text-bone2 shrink-0">{c.name}</span>
                <div className="flex-1 h-2 rounded-full bg-edge overflow-hidden">
                  <div
                    className={`h-full ${c.sentiment >= 80 ? "bg-mint" : c.sentiment >= 70 ? "bg-gold" : "bg-chip"}`}
                    style={{ width: `${c.sentiment}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-bone2 w-10 text-right">{c.sentiment}%</span>
                <span className="font-mono text-[10px] text-mute w-14 text-right">{count} yorum</span>
                <TrustBadge score={c.trustScore} />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <ReviewForm casinoNames={casinoNames} />

        <section className="panel p-4">
          <h2 className="panel-title mb-3">Topluluk yorumları · en faydalılar</h2>
          <ul className="divide-y divide-edge">
            {reviews.length ? (
              reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <li className="py-4 text-sm text-mute">Henüz yorum yok — ilk paylaşan sen ol.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
