"use client";
import { useId } from "react";

/* ============================================================
   MihenkScore form kontrolleri — uiverse etkileşim mantığı,
   ink/mint/gold paletine uyarlanmış. Sade, tutarlı, erişilebilir.
   ============================================================ */

// --- Animasyonlu Toggle / Switch ---
export function Toggle({ checked, onChange, label, size = "md" }) {
  const id = useId();
  const track = size === "sm" ? "w-9 h-5" : "w-11 h-6";
  const knob = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const shift = size === "sm" ? "16px" : "20px";
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        className={`relative ${track} rounded-full border transition-colors duration-200
          ${checked ? "bg-mint/20 border-mint/60" : "bg-ink border-edge"}
          peer-focus-visible:ring-2 peer-focus-visible:ring-mint peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink`}
      >
        <span
          className={`absolute top-1/2 left-0.5 ${knob} rounded-full transition-transform duration-200`}
          style={{
            transform: `translateY(-50%) translateX(${checked ? shift : "0px"})`,
            background: checked ? "var(--mint)" : "var(--mute)",
            boxShadow: checked ? "0 0 10px -1px rgba(47,191,143,.8)" : "none"
          }}
        />
      </span>
      {label && <span className="text-sm text-bone2">{label}</span>}
    </label>
  );
}

// --- Animasyonlu Checkbox ---
export function Checkbox({ checked, onChange, label }) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        className={`relative w-5 h-5 rounded-md border transition-all duration-200 grid place-items-center
          ${checked ? "bg-mint border-mint shadow-[0_0_10px_-2px_rgba(47,191,143,.7)]" : "bg-ink border-edge group-hover:border-mint/50"}
          peer-focus-visible:ring-2 peer-focus-visible:ring-mint peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink`}
      >
        <svg
          viewBox="0 0 16 16"
          className={`w-3 h-3 transition-all duration-200 ${checked ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        >
          <path d="M13 4L6 11L3 8" fill="none" stroke="#0B0E14" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label && <span className="text-sm text-bone2">{label}</span>}
    </label>
  );
}

// --- Gelişmiş Input (focus glow + opsiyonel ikon/prefix) ---
export function Input({ value, onChange, placeholder, type = "text", icon, prefix, className = "", ...rest }) {
  return (
    <div
      className={`group relative flex items-center bg-ink border border-edge rounded-lg transition-all duration-200
        focus-within:border-mint/60 focus-within:shadow-[0_0_0_3px_rgba(47,191,143,.12)] ${className}`}
    >
      {icon && <span className="pl-3 text-mute group-focus-within:text-mint transition-colors">{icon}</span>}
      {prefix && <span className="pl-3 text-mute font-mono text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-bone placeholder:text-mute/60 focus:outline-none"
        {...rest}
      />
    </div>
  );
}

// --- Segmented control (filtreler için çoklu seçenek) ---
export function Segment({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-ink border border-edge rounded-lg p-0.5 gap-0.5">
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const active = val === value;
        return (
          <button
            key={val}
            onClick={() => onChange?.(val)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all duration-200
              ${active ? "bg-mint text-ink font-semibold shadow-[0_0_12px_-4px_rgba(47,191,143,.6)]" : "text-mute hover:text-bone2"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
