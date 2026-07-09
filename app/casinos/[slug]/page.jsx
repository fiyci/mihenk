import { readDB, fmtUsd } from "../../../lib/store";
import { seriesForCasino, casinoMetrics, casinoRank } from "../../../lib/snapshot";
import { AreaChart } from "../../../components/chart";
import { TrustBadge } from "../../../components/ui";
import { ReviewCard } from "../../../components/reviews";
import { BRAND } from "../../../lib/brand";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// SEO: her casino için ayrı başlık/açıklama
export async function generateMetadata({ params }) {
  const db = await readDB();
  const c = db.casinos.find((x) => x.slug === params.slug || x.name.toLowerCase() === params.slug);
  if (!c) return { title: `Casino bulunamadı — ${BRAND.name}` };
  return {
    title: `${c.name} — hacim, güven skoru ve oyuncu yorumları | ${BRAND.name}`,
    description: `${c.name} için 7 günlük on-chain hacim ${fmtUsd(c.volume7d)}, güven skoru ${c.trustScore}/100. Oyuncu yorumları, sponsor yayıncılar ve son işlemler.`
  };
}

export default async function CasinoDetail({ params }) {
  const db = await readDB();
  const c = db.casinos.find((x) => x.slug === params.slug || x.name.toLowerCase() === params.slug);
  if (!c) notFound();

  const series = seriesForCasino(db, c.name);
  const metrics = casinoMetrics(db, c.name);
  const rank = casinoRank(db, c.name);
  const streamers = db.streamers.filter((s) => s.casino === c.name).sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
  const txs = db.transactions.filter((t) => t.casino === c.name).slice(0, 8);
  const reviews = db.reviews
    .filter((r) => r.casino === c.name && r.approved !== false)
    .sort((a, b) => (b.helpful || 0) - (a.helpful || 0));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Link href="/casinos" className="text-xs font-mono text-mint hover:underline">← Tüm casinolar</Link>
        <div className="flex items-center gap-3 mt-4">
          <span className="w-12 h-12 rounded-full bg-felt grid place-items-center text-mint text-lg font-bold shrink-0 overflow-hidden">
            {c.logo ? <img src={c.logo} alt={c.name} className="w-full h-full object-cover" /> : c.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="display-xl text-4xl md:text-5xl text-bone">{c.name}</h1>
            <p className="text-xs text-mute font-mono mt-0.5">
              7g hacim {fmtUsd(c.volume7d)} · pazar payı {c.share7d}% · {(c.chains || []).join(" · ") || "—"}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <TrustBadge score={c.trustScore} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-4 text-center">
          <div className="panel-title mb-1">Zirve (ATH)</div>
          <div className="font-mono text-lg text-gold">{fmtUsd(metrics.ath)}</div>
        </div>
        <div className="panel p-4 text-center">
          <div className="panel-title mb-1">Ortalama</div>
          <div className="font-mono text-lg text-bone2">{fmtUsd(metrics.avg30)}</div>
        </div>
        <div className="panel p-4 text-center">
          <div className="panel-title mb-1">Sıralama</div>
          <div className="font-mono text-lg text-mint">{rank ? `#${rank}` : "—"}</div>
        </div>
      </div>

      <section className="panel p-4">
        <AreaChart data={series} label="Hacim geçmişi" color="#E8B84B" height={140} />
        {metrics.dataPoints > 0 && (
          <p className="text-[10px] font-mono text-mute mt-2">{metrics.dataPoints} snapshot noktasından hesaplandı.</p>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="panel p-4">
          <h2 className="panel-title mb-3">Sponsor yayıncılar · {streamers.length}</h2>
          {streamers.length ? (
            <ul className="divide-y divide-edge">
              {streamers.map((s) => (
                <li key={s.id} className="py-2 flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${s.live ? "bg-mint" : "bg-mute"}`} />
                  <span className="font-medium">{s.handle}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-edge text-mute">{s.platform}</span>
                  <span className="ml-auto font-mono text-xs text-mute">{s.viewers?.toLocaleString("tr-TR")}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-mute">Takip edilen yayıncı yok.</p>}
        </section>

        <section className="panel p-4">
          <h2 className="panel-title mb-3">Son işlemler</h2>
          {txs.length ? (
            <ul className="divide-y divide-edge font-mono text-xs">
              {txs.map((t) => (
                <li key={t.id} className="py-2 flex items-center gap-2">
                  <span className={t.type === "deposit" ? "text-mint" : "text-chip"}>{t.type === "deposit" ? "▲" : "▼"}</span>
                  <span className="text-mute">{t.chain}</span>
                  <span className="ml-auto text-gold">{fmtUsd(t.amountUsd)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-mute">Kayıtlı işlem yok.</p>}
        </section>
      </div>

      <section className="panel p-4">
        <h2 className="panel-title mb-3">Oyuncu yorumları · {reviews.length}</h2>
        {reviews.length ? (
          <ul className="divide-y divide-edge">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </ul>
        ) : (
          <p className="text-sm text-mute">
            Henüz yorum yok. <Link href="/sentiment" className="text-mint hover:underline">İlk yorumu sen yaz →</Link>
          </p>
        )}
      </section>
    </div>
  );
}
