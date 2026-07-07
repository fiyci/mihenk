// İzleme listesindeki sıcak cüzdanlara giren/çıkan stablecoin (USDT/USDC)
// transferlerini çeker. Stablecoin seçmemizin nedeni: tutar doğrudan USD'dir,
// ayrıca fiyat dönüşümü gerekmez.
//
// ETH  → Etherscan V2 API (env: ETHERSCAN_API_KEY, ücretsiz plan yeterli)
// TRX  → Tronscan public API (anahtar gerekmez, hafif kullanım için)

const ERC20_USD = {
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6 },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC", decimals: 6 }
};
const TRC20_USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // Tron USDT kontratı

function short(hash) {
  return hash ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : "";
}

async function fetchEthWallet(w) {
  const url =
    `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx` +
    `&address=${w.address}&page=1&offset=25&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Etherscan hatası: ${res.status}`);
  const data = await res.json();
  if (data.status !== "1" || !Array.isArray(data.result)) return [];

  const txs = [];
  for (const t of data.result) {
    const token = ERC20_USD[(t.contractAddress || "").toLowerCase()];
    if (!token) continue; // sadece stablecoin
    const isIncoming = t.to?.toLowerCase() === w.address.toLowerCase();
    const amountUsd = Number(t.value) / 10 ** token.decimals;
    if (amountUsd < 100) continue; // gürültüyü ele
    txs.push({
      id: `eth_${t.hash}_${t.transactionIndex || 0}`,
      casino: w.casino,
      chain: "ETH",
      type: isIncoming ? "deposit" : "withdrawal",
      amountUsd: Math.round(amountUsd),
      tx: short(t.hash),
      ts: new Date(Number(t.timeStamp) * 1000).toISOString(),
      source: "auto"
    });
  }
  return txs;
}

async function fetchTrxWallet(w) {
  const url =
    `https://apilist.tronscanapi.com/api/token_trc20/transfers` +
    `?relatedAddress=${w.address}&contract_address=${TRC20_USDT}&limit=25&start=0&sort=-timestamp`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tronscan hatası: ${res.status}`);
  const data = await res.json();
  const list = data.token_transfers || data.data || [];

  const txs = [];
  for (const t of list) {
    const isIncoming = t.to_address === w.address;
    const amountUsd = Number(t.quant || t.amount || 0) / 1e6;
    if (amountUsd < 100) continue;
    txs.push({
      id: `trx_${t.transaction_id}`,
      casino: w.casino,
      chain: "TRX",
      type: isIncoming ? "deposit" : "withdrawal",
      amountUsd: Math.round(amountUsd),
      tx: short(t.transaction_id),
      ts: new Date(t.block_ts || t.timestamp || Date.now()).toISOString(),
      source: "auto"
    });
  }
  return txs;
}

export async function fetchChainActivity(wallets) {
  const results = [];
  const errors = [];
  for (const w of wallets || []) {
    // Placeholder adresleri atla
    if (!w.address || /^0x0{10,}/.test(w.address) || /^T0{10,}/.test(w.address)) continue;
    try {
      if (w.chain === "ETH") {
        if (!process.env.ETHERSCAN_API_KEY) {
          errors.push(`${w.casino}: ETHERSCAN_API_KEY tanımlı değil`);
          continue;
        }
        results.push(...(await fetchEthWallet(w)));
      } else if (w.chain === "TRX") {
        results.push(...(await fetchTrxWallet(w)));
      }
    } catch (e) {
      errors.push(`${w.casino} (${w.chain}): ${e.message}`);
    }
  }
  return { txs: results, errors };
}
