import { readDB } from "../../lib/store";
import { StreamerRows } from "../../components/ui";
import { BRAND } from "../../lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Yayıncılar — ${BRAND.name}` };

export default async function Streamers() {
  const db = await readDB();
  const live = db.streamers.filter((s) => s.live).sort((a, b) => b.viewers - a.viewers);
  const offline = db.streamers.filter((s) => !s.live);
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Kumar yayıncıları</h1>
        <p className="text-mute text-sm mt-1">
          Kick ve Twitch üzerinde takip edilen yayıncılar, sponsor casino ve anlık izleyici sayılarıyla.
        </p>
      </div>
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
