import { readDB, fmtUsd } from "../../lib/store";
import { TrustBadge } from "../../components/ui";
import Link from "next/link";
import { BRAND } from "../../lib/brand";

export const dynamic = "force-dynamic";
export const metadata = { title: `Casinolar — ${BRAND.name}` };

export default async function Casinos() {
  const db = await readDB();
  const casinos = [...db.casinos].sort((a, b) => b.volume7d - a.volume7d);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-50">Casinolar</h1>
      <p className="text-mute text-sm mt-1">7 günlük on-chain hacme göre sıralı {casinos.length} platform.</p>
      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-wider text-mute border-b border-edge">
              <th className="p-3">#</th>
              <th className="p-3">Casino</th>
              <th className="p-3">Hacim · 7g</th>
              <th className="p-3">Pay</th>
              <th className="p-3">Yatırım adedi</th>
              <th className="p-3">Zincirler</th>
              <th className="p-3">Güven</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {casinos.map((c, i) => (
              <tr key={c.id} className="hover:bg-edge/30 transition">
                <td className="p-3 font-mono text-mute">{i + 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-felt grid place-items-center text-mint text-xs font-bold">
                      {c.name.slice(0, 2).toUpperCase()}
                    </span>
                    <Link href={`/casinos/${c.slug || c.name.toLowerCase()}`} className="text-slate-200 font-medium hover:text-mint transition">{c.name}</Link>
                  </div>
                </td>
                <td className="p-3 font-mono text-gold">{fmtUsd(c.volume7d)}</td>
                <td className="p-3 font-mono text-mute">{c.share7d}%</td>
                <td className="p-3 font-mono">{c.deposits7d.toLocaleString("tr-TR")}</td>
                <td className="p-3 font-mono text-xs text-mute">{c.chains.join(" · ")}</td>
                <td className="p-3"><TrustBadge score={c.trustScore} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
