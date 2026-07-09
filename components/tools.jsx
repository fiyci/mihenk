"use client";
import { useState } from "react";
import { Input } from "./controls";

// ---- Oran Dönüştürücü ----
export function OddsConverter() {
  const [decimal, setDecimal] = useState("2.50");

  const d = parseFloat(decimal) || 0;
  const valid = d > 1;
  const fractional = valid ? toFraction(d - 1) : "—";
  const american = valid ? (d >= 2 ? `+${Math.round((d - 1) * 100)}` : `${Math.round(-100 / (d - 1))}`) : "—";
  const implied = valid ? `${((1 / d) * 100).toFixed(1)}%` : "—";

  function toFraction(x) {
    // basit kesir yaklaşımı
    const tolerance = 0.01;
    for (let den = 1; den <= 100; den++) {
      const num = Math.round(x * den);
      if (Math.abs(x - num / den) < tolerance) return `${num}/${den}`;
    }
    return x.toFixed(2);
  }

  return (
    <div className="panel p-5">
      <h2 className="font-semibold text-bone">Oran Dönüştürücü</h2>
      <p className="text-sm text-mute mt-1 mb-4">Ondalık oranı gir; kesirli, Amerikan ve olasılık karşılığını gör.</p>
      <label className="text-[10px] font-mono uppercase text-mute">Ondalık oran</label>
      <div className="mt-1">
        <Input value={decimal} onChange={setDecimal} inputMode="decimal" placeholder="2.50" />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="bg-ink rounded-md p-3">
          <div className="text-[10px] font-mono uppercase text-mute">Kesirli</div>
          <div className="font-mono text-mint mt-1">{fractional}</div>
        </div>
        <div className="bg-ink rounded-md p-3">
          <div className="text-[10px] font-mono uppercase text-mute">Amerikan</div>
          <div className="font-mono text-gold mt-1">{american}</div>
        </div>
        <div className="bg-ink rounded-md p-3">
          <div className="text-[10px] font-mono uppercase text-mute">Olasılık</div>
          <div className="font-mono text-bone2 mt-1">{implied}</div>
        </div>
      </div>
      {!valid && decimal !== "" && <p className="text-chip text-xs mt-2">Oran 1.00'den büyük olmalı.</p>}
    </div>
  );
}

// ---- Bonus Çevrim Hesaplayıcı ----
export function WagerCalculator() {
  const [bonus, setBonus] = useState("100");
  const [multiplier, setMultiplier] = useState("35");
  const [rtp, setRtp] = useState("96");

  const b = parseFloat(bonus) || 0;
  const m = parseFloat(multiplier) || 0;
  const r = parseFloat(rtp) || 0;
  const totalWager = b * m;
  const expectedLoss = totalWager * (1 - r / 100);
  const evValue = b - expectedLoss;

  return (
    <div className="panel p-5">
      <h2 className="font-semibold text-bone">Bonus Çevrim Hesaplayıcı</h2>
      <p className="text-sm text-mute mt-1 mb-4">Çevrim şartını girerek bonusun gerçek beklenen değerini gör.</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] font-mono uppercase text-mute">Bonus ($)</label>
          <div className="mt-1"><Input value={bonus} onChange={setBonus} inputMode="decimal" /></div>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-mute">Çevrim (x)</label>
          <div className="mt-1"><Input value={multiplier} onChange={setMultiplier} inputMode="decimal" /></div>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-mute">Oyun RTP (%)</label>
          <div className="mt-1"><Input value={rtp} onChange={setRtp} inputMode="decimal" /></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="bg-ink rounded-md p-3">
          <div className="text-[10px] font-mono uppercase text-mute">Toplam çevrim</div>
          <div className="font-mono text-bone2 mt-1">${totalWager.toLocaleString("tr-TR")}</div>
        </div>
        <div className="bg-ink rounded-md p-3">
          <div className="text-[10px] font-mono uppercase text-mute">Beklenen kayıp</div>
          <div className="font-mono text-chip mt-1">${expectedLoss.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-ink rounded-md p-3">
          <div className="text-[10px] font-mono uppercase text-mute">Bonus net değeri</div>
          <div className={`font-mono mt-1 ${evValue >= 0 ? "text-mint" : "text-chip"}`}>
            ${evValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
      <p className="text-[10px] font-mono text-mute mt-3">
        Net değer negatifse çevrim şartı, bonusun teorik değerini sıfırlıyor demektir. Bu araç bilgilendirme amaçlıdır; kumar oynamayı teşvik etmez.
      </p>
    </div>
  );
}
