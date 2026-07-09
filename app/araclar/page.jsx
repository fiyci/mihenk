import { BRAND } from "../../lib/brand";
import { OddsConverter, WagerCalculator } from "../../components/tools";
import { PageHeader } from "../../components/ui";

export const metadata = {
  title: `Araçlar — Bonus Hesaplayıcı, Oran Dönüştürücü | ${BRAND.name}`,
  description: "Ücretsiz iGaming araçları: bonus çevrim hesaplayıcı, oran dönüştürücü, VIP hesaplayıcı ve daha fazlası."
};

const comingSoon = [
  { name: "VIP / Rakeback Hesaplayıcı", desc: "Yatırım hacmine göre VIP seviyesi ve rakeback getirisi." },
  { name: "Kelly Kriteri Hesaplayıcı", desc: "Optimal bahis miktarını Kelly formülüyle bul." },
  { name: "Slot RTP Karşılaştırıcı", desc: "Popüler slotların teorik geri dönüş oranlarını kıyasla." },
  { name: "Whale Takip Alarmı", desc: "Büyük transferler için Telegram bildirimi kur." }
];

export default function Araclar() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <PageHeader
        eyebrow="Oyuncu araçları"
        title="Araçlar"
        subtitle="Oyuncular için ücretsiz hesaplayıcılar ve yardımcı araçlar. Yeni araçlar sürekli ekleniyor."
      />

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <OddsConverter />
        <WagerCalculator />
      </div>

      <h2 className="panel-title mt-10 mb-4">Yolda olanlar</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {comingSoon.map((t) => (
          <div key={t.name} className="panel p-5 relative opacity-80">
            <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-wider text-gold border border-gold/40 rounded px-2 py-0.5">
              çok yakında
            </span>
            <h3 className="font-semibold text-bone pr-24">{t.name}</h3>
            <p className="text-sm text-mute mt-2">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
