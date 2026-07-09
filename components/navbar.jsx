"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavBar({ brand, links }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="border-b border-edge sticky top-0 z-40 bg-ink/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-gold to-[#9d7628] grid place-items-center text-ink text-sm shadow-[0_0_16px_-6px_rgba(217,169,76,.7)] group-hover:shadow-[0_0_20px_-4px_rgba(217,169,76,.9)] transition-shadow" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            M
          </span>
          <span className="tracking-tight text-bone text-[17px]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            {brand}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-active={isActive(l.href)}
              className={`nav-link ${isActive(l.href) ? "text-bone" : "text-mute hover:text-bone"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/for-operators"
            className="hidden sm:inline text-xs font-mono border border-mint/40 rounded-md px-3 py-1.5 text-mint hover:bg-mint/10 transition"
          >
            Operatörler için
          </Link>
          <Link
            href="/admin"
            className="hidden sm:inline text-xs font-mono border border-edge rounded-md px-3 py-1.5 text-mute hover:text-mint hover:border-mint/50 transition"
          >
            Admin
          </Link>
          {/* mobil menü butonu */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden w-8 h-8 grid place-items-center text-bone2 border border-edge rounded-md"
            aria-label="Menü"
          >
            <span className="text-lg leading-none">{open ? "×" : "≡"}</span>
          </button>
        </div>
      </div>

      {/* mobil açılır menü */}
      {open && (
        <nav className="md:hidden border-t border-edge bg-ink/95 backdrop-blur px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`py-2 px-2 rounded-md text-sm ${isActive(l.href) ? "text-mint bg-panel" : "text-mute"}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-2 pt-2 border-t border-edge">
            <Link href="/for-operators" onClick={() => setOpen(false)} className="flex-1 text-center text-xs font-mono border border-mint/40 rounded-md px-3 py-2 text-mint">Operatörler için</Link>
            <Link href="/admin" onClick={() => setOpen(false)} className="flex-1 text-center text-xs font-mono border border-edge rounded-md px-3 py-2 text-mute">Admin</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
