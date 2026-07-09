"use client";
import { useState, useMemo } from "react";
import { Segment, Toggle } from "./controls";

function fmtUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}Mr`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

const EXPLORERS = {
  ETH: "https://etherscan.io/tx/",
  TRX: "https://tronscan.org/#/transaction/",
  SOL: "https://solscan.io/tx/",
  BTC: "https://mempool.space/tx/",
  BSC: "https://bscscan.com/tx/"
};

const WHALE = 500000; // $500K üstü whale

export function TxExplorer({ transactions, casinos, chains }) {
  const [chain, setChain] = useState("all");
  const [casino, setCasino] = useState("all");
  const [type, setType] = useState("all");
  const [minAmount, setMinAmount] = useState(0);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => chain === "all" || t.chain === chain)
      .filter((t) => casino === "all" || t.casino === casino)
      .filter((t) => type === "all" || t.type === type)
      .filter((t) => t.amountUsd >= minAmount)
      .sort((a, b) => b.amountUsd - a.amountUsd);
  }, [transactions, chain, casino, type, minAmount]);

  const totalIn = filtered.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amountUsd, 0);
  const totalOut = filtered.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amountUsd, 0);
  const net = totalIn - totalOut;

  const sel = "bg-ink border border-edge rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-mint/60 transition-colors";

  return (
    <div>
      {/* filtreler */}
      <div className="space-y-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <select value={chain} onChange={(e) => setChain(e.target.value)} className={sel}>
            <option value="all">Tüm zincirler</option>
            {chains.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={casino} onChange={(e) => setCasino(e.target.value)} className={sel}>
            <option value="all">Tüm casinolar</option>
            {casinos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Segment
            value={type}
            onChange={setType}
            options={[{ value: "all", label: "Hepsi" }, { value: "deposit", label: "Yatırım" }, { value: "withdrawal", label: "Çekim" }]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="eyebrow">Min tutar</span>
          <Segment
            value={String(minAmount)}
            onChange={(v) => setMinAmount(Number(v))}
            options={[{ value: "0", label: "Hepsi" }, { value: "10000", label: "$10K+" }, { value: "100000", label: "$100K+" }]}
          />
          <Toggle
            checked={minAmount >= 500000}
            onChange={(on) => setMinAmount(on ? 500000 : 0)}
            label="🐋 Sadece whale ($500K+)"
            size="sm"
          />
        </div>
      </div>

      {/* özet */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-ink rounded-md p-3 text-center">
          <div className="text-[10px] font-mono uppercase text-mute">Giriş</div>
          <div className="font-mono text-mint mt-1">{fmtUsd(totalIn)}</div>
        </div>
        <div className="bg-ink rounded-md p-3 text-center">
          <div className="text-[10px] font-mono uppercase text-mute">Çıkış</div>
          <div className="font-mono text-chip mt-1">{fmtUsd(totalOut)}</div>
        </div>
        <div className="bg-ink rounded-md p-3 text-center">
          <div className="text-[10px] font-mono uppercase text-mute">Net akış</div>
          <div className={`font-mono mt-1 ${net >= 0 ? "text-mint" : "text-chip"}`}>{net >= 0 ? "+" : ""}{fmtUsd(Math.abs(net))}</div>
        </div>
      </div>

      {/* tablo */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-wider text-mute border-b border-edge">
              <th className="p-2">Casino</th>
              <th className="p-2">Zincir</th>
              <th className="p-2">Tip</th>
              <th className="p-2">Tutar</th>
              <th className="p-2 hidden md:table-cell">Tx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge font-mono text-xs">
            {filtered.map((t) => (
              <tr key={t.id} className="row-hover">
                <td className="p-2 text-bone2">{t.casino}</td>
                <td className="p-2 text-mute">{t.chain}</td>
                <td className="p-2">
                  <span className={t.type === "deposit" ? "text-mint" : "text-chip"}>
                    {t.type === "deposit" ? "↓ yatırım" : "↑ çekim"}
                  </span>
                </td>
                <td className="p-2 text-gold">
                  {fmtUsd(t.amountUsd)}
                  {t.amountUsd >= WHALE && <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-gold/20 text-gold">🐋 whale</span>}
                </td>
                <td className="p-2 text-mute hidden md:table-cell">
                  {EXPLORERS[t.chain] ? (
                    <a href={`${EXPLORERS[t.chain]}${t.tx}`} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-mint underline">
                      {t.tx?.slice(0, 10)}…
                    </a>
                  ) : (t.tx?.slice(0, 10) + "…")}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={5} className="p-6 text-center text-mute">Bu filtrelerle işlem bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] font-mono text-mute mt-3">{filtered.length} işlem gösteriliyor · 🐋 = $500K üstü whale hareketi</p>
    </div>
  );
}
