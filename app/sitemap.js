import { readDB } from "../lib/store";

const BASE = "https://mihenks.vercel.app"; // Kendi domainini bağlayınca burayı güncelle

export default async function sitemap() {
  const db = await readDB();
  const staticPages = ["", "/casinos", "/blockchain", "/streamers", "/sentiment", "/araclar"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "hourly",
    priority: p === "" ? 1 : 0.8
  }));
  const casinoPages = db.casinos.map((c) => ({
    url: `${BASE}/casinos/${c.slug || c.name.toLowerCase()}`,
    changeFrequency: "daily",
    priority: 0.7
  }));
  const streamerPages = db.streamers.map((s) => ({
    url: `${BASE}/streamers/${s.slug || s.handle.toLowerCase()}`,
    changeFrequency: "daily",
    priority: 0.6
  }));
  return [...staticPages, ...casinoPages, ...streamerPages];
}
