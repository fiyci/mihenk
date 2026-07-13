"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dice5 } from "lucide-react";

export function NavBar({ brand, links }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-md border-b border-edge/60">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="w-8 h-8 rounded-lg bg-[#0F1712] border border-mint/30 grid place-items-center shadow-[0_0_14px_-4px_rgba(34,197,94,.55)] group-hover:shadow-[0_0_18px_-3px_rgba(34,197,94,.8)] transition-shadow">
            <Dice5 size={17} strokeWidth={2} className="text-mint" />
          </span>
          <span className="font-bold tracking-tight text-bone text-[16px]">
            {brand}<span className="text-mint">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/streamers"
            className="hidden sm:inline-flex items-center text-[13px] font-semibold border border-mint/50 text-mint rounded-lg px-4 py-1.5 hover:bg-mint/10 hover:shadow-[0_0_16px_-6px_rgba(34,197,94,.7)] transition-all"
          >
            Yayıncı Girişi
          </Link>
          <Link
            href="/operator"
            className="hidden sm:inline-flex items-center text-[13px] font-semibold border border-edge text-bone2 rounded-lg px-4 py-1.5 hover:border-bone2/50 hover:text-bone transition-all"
          >
            Operatör Girişi
          </Link>
          {/* mobil menü */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="xl:hidden w-9 h-9 grid place-items-center text-bone2 border border-edge rounded-lg"
            aria-label="Menü"
          >
            <span className="text-lg leading-none">{open ? "×" : "≡"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="xl:hidden border-t border-edge bg-ink/95 backdrop-blur px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`py-2.5 px-3 rounded-lg text-sm ${isActive(l.href) ? "text-mint bg-panel border border-mint/25" : "text-bone2"}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-2 pt-2 border-t border-edge">
            <Link href="/streamers" onClick={() => setOpen(false)} className="flex-1 text-center text-xs font-semibold border border-mint/50 rounded-lg px-3 py-2.5 text-mint">Yayıncı Girişi</Link>
            <Link href="/operator" onClick={() => setOpen(false)} className="flex-1 text-center text-xs font-semibold border border-edge rounded-lg px-3 py-2.5 text-bone2">Operatör Girişi</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
