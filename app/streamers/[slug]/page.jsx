import { readDB, fmtViewers } from "../../../lib/store";
import { StreamerReviewForm, StreamerReviewCard } from "../../../components/streamerReviews";
import { streamerMetrics, streamerRank, streamerHeatmap, streamerSeries } from "../../../lib/snapshot";
import { Heatmap } from "../../../components/heatmap";
import { AreaChart } from "../../../components/chart";
import { BRAND } from "../../../lib/brand";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Radio, Send, Twitter, Youtube } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const db = await readDB();
  const s = db.streamers.find((x) => x.slug === params.slug || x.handle.toLowerCase() === params.slug);
  if (!s) return { title: `Yayıncı bulunamadı — ${BRAND.name}` };
  return {
    title: `${s.handle} — ${s.platform} kumar yayıncısı, puan ve yorumlar | ${BRAND.name}`,
    description: `${s.handle} (${s.platform}) hakkında oyuncu yorumları ve ${s.rating}/5 topluluk puanı. Sponsor casino: ${s.casino || "—"}.`
  };
}

export default async function StreamerDetail({ params }) {
  const db = await readDB();
  const s = db.streamers.find((x) => x.slug === params.slug || x.handle.toLowerCase() === params.slug);
  if (!s) notFound();

  const metrics = streamerMetrics(db, s.handle);
  const rank = streamerRank(db, s.handle);
  const heatmap = streamerHeatmap(db, s.handle);
  const series = streamerSeries(db, s.handle);

  const reviews = (db.streamerReviews || [])
    .filter((r) => r.streamer === s.handle && r.approved !== false)
    .sort((a, b) => (b.helpful || 0) - (a.helpful || 0));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Link href="/streamers" className="text-xs font-mono text-mint hover:underline">← Tüm yayıncılar</Link>
        <div className="flex items-center gap-3 mt-4">
          <span className={`w-3 h-3 rounded-full ${s.live ? "bg-mint" : "bg-mute"} shrink-0`} />
          <div className="flex-1">
            <h1 className="display-xl text-4xl md:text-5xl text-bone">{s.handle}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-mute flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-edge">{s.platform}</span>
              {s.casino && <span className="px-1.5 py-0.5 rounded bg-felt/60 text-mint">Sponsor: {s.casino}</span>}
              <span>{s.live ? "🔴 canlı" : "çevrimdışı"}</span>
              {s.live && <span>{fmtViewers(s.viewers)} izleyici</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-xl text-gold">{s.rating || "—"}<span className="text-xs text-mute">/5</span></div>
            <div className="text-[10px] font-mono text-mute">{s.reviewCount || 0} yorum</div>
          </div>
        </div>
        {s.bio && <p className="text-sm text-mute mt-3">{s.bio}</p>}
        {s.title && <p className="text-sm text-mute mt-2 font-mono">Son yayın: "{s.title}"</p>}
        {(s.channelUrl || s.telegram || s.twitter || s.youtube) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {s.channelUrl && (
              <a href={s.channelUrl} target="_blank" rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-xs font-mono border border-edge rounded-md px-3 py-1.5 text-bone2 hover:border-mint/50 hover:text-mint transition">
                <Radio size={13} strokeWidth={1.75} /> Yayın kanalı
              </a>
            )}
            {s.telegram && (
              <a href={s.telegram} target="_blank" rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-xs font-mono border border-edge rounded-md px-3 py-1.5 text-bone2 hover:border-mint/50 hover:text-mint transition">
                <Send size={13} strokeWidth={1.75} /> Telegram
              </a>
            )}
            {s.twitter && (
              <a href={s.twitter} target="_blank" rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-xs font-mono border border-edge rounded-md px-3 py-1.5 text-bone2 hover:border-mint/50 hover:text-mint transition">
                <Twitter size={13} strokeWidth={1.75} /> Twitter
              </a>
            )}
            {s.youtube && (
              <a href={s.youtube} target="_blank" rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-xs font-mono border border-edge rounded-md px-3 py-1.5 text-bone2 hover:border-mint/50 hover:text-mint transition">
                <Youtube size={13} strokeWidth={1.75} /> YouTube
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-4 text-center">
          <div className="panel-title mb-1">Zirve izleyici</div>
          <div className="font-mono text-lg text-gold">{fmtViewers(metrics.peak)}</div>
        </div>
        <div className="panel p-4 text-center">
          <div className="panel-title mb-1">Ortalama</div>
          <div className="font-mono text-lg text-bone2">{fmtViewers(metrics.avg)}</div>
        </div>
        <div className="panel p-4 text-center">
          <div className="panel-title mb-1">Sıralama</div>
          <div className="font-mono text-lg text-mint">{rank ? `#${rank}` : "—"}</div>
        </div>
      </div>

      <section className="panel p-4">
        <AreaChart data={series} label="İzleyici geçmişi" color="#2FBF8F" height={130} />
        {metrics.dataPoints > 0 && (
          <p className="text-[10px] font-mono text-mute mt-2">{metrics.dataPoints} snapshot noktasından hesaplandı.</p>
        )}
      </section>

      <section className="panel p-4">
        <h2 className="panel-title mb-3">Yayın ısı haritası · gün × saat (UTC)</h2>
        <Heatmap grid={heatmap.grid} max={heatmap.max} hasData={heatmap.hasData} />
      </section>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <StreamerReviewForm streamerHandle={s.handle} />
        <section className="panel p-4">
          <h2 className="panel-title mb-3">Topluluk yorumları · {reviews.length}</h2>
          {reviews.length ? (
            <ul className="divide-y divide-edge">
              {reviews.map((r) => <StreamerReviewCard key={r.id} review={r} />)}
            </ul>
          ) : <p className="text-sm text-mute">Henüz yorum yok — ilk paylaşan sen ol.</p>}
        </section>
      </div>
    </div>
  );
}
