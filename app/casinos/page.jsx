import { readDB } from "../../lib/store";
import { PageHeader } from "../../components/ui";
import { seriesForCasino } from "../../lib/snapshot";
import { BRAND } from "../../lib/brand";
import { CasinosTable } from "./CasinosTable";

export const dynamic = "force-dynamic";
export const metadata = { title: `Casinolar — ${BRAND.name}` };

export default async function Casinos() {
  const db = await readDB();
  const casinos = [...db.casinos].sort((a, b) => b.volume7d - a.volume7d);
  const seriesMap = {};
  for (const c of casinos) seriesMap[c.name] = seriesForCasino(db, c.name);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader
        eyebrow="Sıralama · Gerçek on-chain hacim"
        title="Casinolar"
        subtitle={`Yatırım hacmine göre sıralı ${casinos.length} platform. Bir casinoya tıklayıp detay, metrik ve yorumlarını görün.`}
      />
      <CasinosTable casinos={casinos} seriesMap={seriesMap} />
    </div>
  );
}
