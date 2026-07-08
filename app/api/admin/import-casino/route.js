import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// Bir casino URL'sinden temel meta verileri çeker: isim, açıklama, logo,
// sayfada geçen zincir/para birimi anahtar kelimeleri. Tek seferlik, admin
// tetikler. Agresif tarama yapmaz — sadece HTML head + metin taraması.

const CHAIN_KEYWORDS = {
  ETH: ["ethereum", "erc-20", "erc20", " eth ", "ether"],
  TRX: ["tron", "trc-20", "trc20", " trx "],
  SOL: ["solana", " sol "],
  BTC: ["bitcoin", " btc ", "lightning"],
  USDT: ["usdt", "tether"],
  USDC: ["usdc", "usd coin"]
};

function extract(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : "";
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").trim();
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  let { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL gerekli." }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  let host;
  try { host = new URL(url).hostname.replace(/^www\./, ""); }
  catch { return NextResponse.json({ error: "Geçersiz URL." }, { status: 400 }); }

  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MihenkScoreBot/1.0)" },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return NextResponse.json({ error: `Sayfa alınamadı (${res.status}).` }, { status: 400 });
    html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: `Sayfaya ulaşılamadı: ${e.message}` }, { status: 400 });
  }

  // Meta veriler
  const ogTitle = extract(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
    || extract(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const titleTag = extract(html, /<title[^>]*>([^<]+)<\/title>/i);
  const description = extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || extract(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const ogImage = extract(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);

  // İsim: og:site_name > title'ın ilk parçası > host
  let name = decodeEntities(ogTitle || titleTag.split(/[|\-–—:]/)[0] || host);
  name = name.slice(0, 40);

  // Slug
  const slug = host.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

  // Logo: og:image varsa o, yoksa favicon servisi
  const logo = ogImage || `https://www.google.com/s2/favicons?domain=${host}&sz=64`;

  // Zincirler: sayfa metninde anahtar kelime taraması
  const lower = (" " + html.toLowerCase().replace(/<[^>]+>/g, " ") + " ").replace(/\s+/g, " ");
  const chains = Object.entries(CHAIN_KEYWORDS)
    .filter(([, kws]) => kws.some((k) => lower.includes(k)))
    .map(([chain]) => chain)
    // stablecoinleri ayrı listeleme, ana zincirlerle çakışmasın
    .filter((c) => ["ETH", "TRX", "SOL", "BTC"].includes(c));

  return NextResponse.json({
    ok: true,
    data: {
      name,
      slug,
      website: url,
      logo,
      description: decodeEntities(description).slice(0, 200),
      chains,
      host
    }
  });
}
