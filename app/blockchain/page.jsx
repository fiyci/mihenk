import { readDB, fmtUsd } from "../../lib/store";
import { Panel, PageHeader } from "../../components/ui";
import { Heatmap } from "../../components/heatmap";
import { TxExplorer } from "../../components/txExplorer";
import { activityHeatmap } from "../../lib/snapshot";
import { BRAND } from "../../lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Blockchain — ${BRAND.name}` };

export default async function Blockchain() {
  const db = await readDB();
  const heatmap = activityHeatmap(db);
  const casinoNames = [...new Set(db.transactions.map((t) => t.casino))].sort();
  const chainNames = [...new Set(db.transactions.map((t) => t.chain))].sort();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <PageHeader
        eyebrow="On-chain forensik"
        title="Blockchain aktivitesi"
        subtitle="Takip edilen sıcak cüzdanlara giren/çıkan stablecoin transferleri. Zincir, casino, tip ve tutara göre filtreleyin."
      />
      <Panel title="İşlem gezgini">
        <TxExplorer transactions={db.transactions} casinos={casinoNames} chains={chainNames} />
      </Panel>
      <Panel title="Aktivite ısı haritası · gün × saat (UTC)">
        <Heatmap grid={heatmap.grid} max={heatmap.max} hasData={heatmap.hasData} />
      </Panel>
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
