import { readDB } from "../../lib/store";
import { StreamerRows, PageHeader } from "../../components/ui";
import { risingStreamers } from "../../lib/snapshot";
import { TrendBadge } from "../../components/trend";
import { StreamerSearch } from "../../components/streamerSearch";
import { BRAND } from "../../lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Yayıncılar — ${BRAND.name}` };

export default async function Streamers() {
  const db = await readDB();
  const live = db.streamers.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
  const offline = db.streamers.filter((s) => !s.live);
  const rising = risingStreamers(db, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <PageHeader
        eyebrow="Canlı takip"
        title="Kumar yayıncıları"
        subtitle="Kick ve Twitch üzerinde takip edilen yayıncılar, sponsor casino ve anlık izleyici sayılarıyla."
      />

      <StreamerSearch counts={{ kick: db.streamers.filter((s) => s.platform === "kick").length, twitch: db.streamers.filter((s) => s.platform === "twitch").length }} />

      <section className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="panel-title">Yükselen yayıncılar</h2>
          <span className="text-[10px] font-mono text-mute">izleyici büyümesine göre</span>
        </div>
        {rising.length ? (
          <ol className="divide-y divide-edge">
            {rising.map((s, i) => (
              <li key={s.handle} className="flex items-center gap-3 py-2.5">
                <span className="font-mono text-xs text-mute w-4">{i + 1}</span>
                <span className="flex-1 text-sm text-bone2">{s.handle}</span>
                <span className="font-mono text-xs text-mute">{s.now.toLocaleString("tr-TR")} izleyici</span>
                <span className="text-xs"><TrendBadge change={s.change} /></span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-mute font-mono py-3">
            Büyüme trendi için yeterli veri henüz yok — cron çalıştıkça (izleyici geçmişi biriktikçe) burası dolacak.
          </p>
        )}
      </section>

      <section className="panel p-4">
        <h2 className="panel-title mb-3">Şu an canlı · {live.length}</h2>
        <StreamerRows streamers={live} />
      </section>
      <section className="panel p-4">
        <h2 className="panel-title mb-3">Çevrimdışı · {offline.length}</h2>
        <StreamerRows streamers={offline} />
      </section>
    </div>
  );
}
