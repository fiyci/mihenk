import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// Cüzdan keşfi: verilen bir adresin en çok stablecoin (USDT/USDC) transferi
// yaptığı DİĞER adresleri çıkarır. Bir casinonun cüzdan kümesini haritalamaya
// yarar — sıcak cüzdandan cold/işlemci cüzdanlara doğru zinciri genişletirsin.
// ETH → Etherscan, TRX → Tronscan.

const ERC20_USD = {
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6 },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC", decimals: 6 }
};
const TRC20_USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

function short(a) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : ""; }

async function exploreEth(address) {
  const url =
    `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx` +
    `&address=${address}&page=1&offset=200&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Etherscan ${res.status}`);
  const data = await res.json();
  if (data.status !== "1" || !Array.isArray(data.result)) return [];

  const counter = {};
  const addrLow = address.toLowerCase();
  for (const t of data.result) {
    const token = ERC20_USD[(t.contractAddress || "").toLowerCase()];
    if (!token) continue;
    const other = t.from.toLowerCase() === addrLow ? t.to : t.from;
    if (!other || other === addrLow) continue;
    const usd = Number(t.value) / 10 ** token.decimals;
    if (!counter[other]) counter[other] = { address: other, count: 0, volume: 0 };
    counter[other].count++;
    counter[other].volume += usd;
  }
  return Object.values(counter);
}

async function exploreTrx(address) {
  const url =
    `https://apilist.tronscanapi.com/api/token_trc20/transfers` +
    `?relatedAddress=${address}&contract_address=${TRC20_USDT}&limit=200&start=0&sort=-timestamp`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Tronscan ${res.status}`);
  const data = await res.json();
  const list = data.token_transfers || data.data || [];

  const counter = {};
  for (const t of list) {
    const other = t.from_address === address ? t.to_address : t.from_address;
    if (!other || other === address) continue;
    const usd = Number(t.quant || t.amount || 0) / 1e6;
    if (!counter[other]) counter[other] = { address: other, count: 0, volume: 0 };
    counter[other].count++;
    counter[other].volume += usd;
  }
  return Object.values(counter);
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { address, chain } = await req.json();
  if (!address) return NextResponse.json({ error: "Adres gerekli." }, { status: 400 });

  try {
    let results = [];
    if (chain === "ETH") {
      if (!process.env.ETHERSCAN_API_KEY) return NextResponse.json({ error: "ETHERSCAN_API_KEY tanımlı değil." }, { status: 400 });
      results = await exploreEth(address);
    } else if (chain === "TRX") {
      results = await exploreTrx(address);
    } else {
      return NextResponse.json({ error: "Zincir ETH veya TRX olmalı." }, { status: 400 });
    }

    // Hacme göre sırala, ilk 15, kısaltılmış adresle
    const top = results
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 15)
      .map((r) => ({
        address: r.address,
        short: short(r.address),
        count: r.count,
        volume: Math.round(r.volume)
      }));

    return NextResponse.json({ ok: true, chain, source: address, related: top });
  } catch (e) {
    return NextResponse.json({ error: `Keşif başarısız: ${e.message}` }, { status: 400 });
  }
}
