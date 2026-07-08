import { readDB, fmtUsd } from "../../lib/store";
import { casinoRank } from "../../lib/snapshot";
import { BRAND } from "../../lib/brand";
import { CompareClient } from "./CompareClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: `Casino karşılaştırma — ${BRAND.name}`,
  description: "İki veya üç casinoyu yan yana karşılaştırın: hacim, pazar payı, güven skoru, bağlı yayıncılar."
};

export default async function Compare({ searchParams }) {
  const db = await readDB();
  const selected = (searchParams.casinos || "").split(",").map((s) => s.trim()).filter(Boolean);

  const casinos = db.casinos.map((c) => ({
    name: c.name,
    slug: c.slug || c.name.toLowerCase(),
    volume7d: c.volume7d,
    share7d: c.share7d,
    deposits7d: c.deposits7d,
    trustScore: c.trustScore,
    sentiment: c.sentiment,
    chains: c.chains || [],
    rank: casinoRank(db, c.name),
    streamers: db.streamers.filter((s) => s.casino === c.name).length,
    logo: c.logo || ""
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-50">Casino karşılaştırma</h1>
      <p className="text-mute text-sm mt-1 mb-6">
        İki veya üç casinoyu seçip metriklerini yan yana görün. Karar verirken tahmine değil veriye dayanın.
      </p>
      <CompareClient casinos={casinos} initial={selected} />
    </div>
  );
}
