import { readDB, fmtUsd } from "../../lib/store";
import { Panel } from "../../components/ui";
import { BRAND } from "../../lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Blockchain — ${BRAND.name}` };

function TxTable({ rows }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs font-mono uppercase tracking-wider text-mute border-b border-edge">
          <th className="p-2">Casino</th>
          <th className="p-2">Zincir</th>
          <th className="p-2">Tutar</th>
          <th className="p-2 hidden md:table-cell">Tx</th>
          <th className="p-2 hidden md:table-cell">Zaman</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-edge font-mono text-xs">
        {rows.map((t) => (
          <tr key={t.id}>
            <td className="p-2 text-slate-200">{t.casino}</td>
            <td className="p-2 text-mute">{t.chain}</td>
            <td className="p-2 text-gold">{fmtUsd(t.amountUsd)}</td>
            <td className="p-2 text-mute hidden md:table-cell">{t.tx}</td>
            <td className="p-2 text-mute hidden md:table-cell">{new Date(t.ts).toLocaleString("tr-TR")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function Blockchain() {
  const db = await readDB();
  const deposits = db.transactions.filter((t) => t.type === "deposit").sort((a, b) => b.amountUsd - a.amountUsd);
  const withdrawals = db.transactions.filter((t) => t.type === "withdrawal").sort((a, b) => b.amountUsd - a.amountUsd);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Blockchain aktivitesi</h1>
        <p className="text-mute text-sm mt-1">
          Takip edilen sıcak cüzdanlara giren/çıkan transferler. MVP'de veriler örnek settir; gerçek zamanlı akış için{" "}
          <code className="text-mint">lib/store.js</code> içine zincir sağlayıcısı bağlanır.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4" id="live-transfers">
        <Panel title="Canlı yatırımlar">
          <TxTable rows={deposits} />
        </Panel>
        <Panel title="Canlı çekimler">
          <TxTable rows={withdrawals} />
        </Panel>
      </div>
      <Panel title="Sıcak cüzdanlar">
        <ol className="divide-y divide-edge">
          {[...db.hotWallets].sort((a, b) => b.balanceUsd - a.balanceUsd).map((w, i) => (
            <li key={w.id} className="flex items-center gap-3 py-2.5">
              <span className="font-mono text-xs text-mute w-4">{i + 1}</span>
              <span className="flex-1 text-sm">{w.casino}</span>
              <span className="font-mono text-sm text-gold">{fmtUsd(w.balanceUsd)}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
