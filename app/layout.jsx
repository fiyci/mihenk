import "./globals.css";
import Link from "next/link";
import { BRAND } from "../lib/brand";
import { Ambient } from "../components/ambient";
import { NavBar } from "../components/navbar";

export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

const navLinks = [
  { href: "/casinos", label: "Casinolar" },
  { href: "/compare", label: "Karşılaştır" },
  { href: "/blockchain", label: "Blockchain" },
  { href: "/streamers", label: "Yayıncılar" },
  { href: "/sentiment", label: "Sentiment" },
  { href: "/araclar", label: "Araçlar" }
];

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-bone2 font-body min-h-screen flex flex-col">
        <Ambient />
        <div className="stack flex flex-col min-h-screen">
          <NavBar brand={BRAND.name} links={navLinks} />
          <main className="flex-1">{children}</main>
        <footer className="border-t border-edge mt-16">
          <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-mute">
            <div>
              <div className="font-bold text-bone2 mb-2">
                {BRAND.name}<span className="text-mint">.</span>
              </div>
              <p>iGaming için istihbarat. Veriler yalnızca bilgilendirme amaçlıdır; yatırım veya bahis tavsiyesi değildir.</p>
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-bone">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/for-operators" className="hover:text-bone">Operatörler için</Link>
              <span>{BRAND.email}</span>
              <span className="font-mono text-xs">© 2026 {BRAND.name}</span>
            </div>
          </div>
        </footer>
        </div>
      </body>
    </html>
  );
}
