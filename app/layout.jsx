import "./globals.css";
import Link from "next/link";
import { BRAND } from "../lib/brand";

export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description
};

const navLinks = [
  { href: "/casinos", label: "Casinolar" },
  { href: "/blockchain", label: "Blockchain" },
  { href: "/streamers", label: "Yayıncılar" },
  { href: "/sentiment", label: "Sentiment" }
];

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-slate-200 font-display min-h-screen flex flex-col">
        <header className="border-b border-edge sticky top-0 z-40 bg-ink/90 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-mint to-felt grid place-items-center text-ink font-bold text-xs">
                B
              </span>
              <span className="font-bold tracking-tight">
                {BRAND.name}<span className="text-mint">.</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-mute">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-slate-100 transition">
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/admin"
              className="text-xs font-mono border border-edge rounded-md px-3 py-1.5 text-mute hover:text-mint hover:border-mint/50 transition"
            >
              Admin
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-edge mt-16">
          <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-mute">
            <div>
              <div className="font-bold text-slate-200 mb-2">
                {BRAND.name}<span className="text-mint">.</span>
              </div>
              <p>iGaming için istihbarat. Veriler yalnızca bilgilendirme amaçlıdır; yatırım veya bahis tavsiyesi değildir.</p>
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-slate-100">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/admin" className="hover:text-slate-100">Operatör Girişi</Link>
              <span>{BRAND.email}</span>
              <span className="font-mono text-xs">© 2026 {BRAND.name}</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
