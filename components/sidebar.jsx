"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Coins, Radio, LineChart, Wallet, CalendarDays, Scale, Wrench, Mail } from "lucide-react";
import { BRAND } from "../lib/brand";

const items = [
  { href: "/", label: "Ana Sayfa", Icon: Home },
  { href: "/casinos", label: "Hacim Sıralaması", Icon: Coins },
  { href: "/streamers", label: "Yayıncılar", Icon: Radio },
  { href: "/sentiment", label: "Sentiment", Icon: LineChart },
  { href: "/blockchain", label: "Cüzdanlar & Zincir", Icon: Wallet },
  { href: "/compare", label: "Karşılaştır", Icon: Scale },
  { href: "/araclar", label: "Araçlar", Icon: Wrench }
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <aside className="hidden xl:block fixed right-5 top-20 w-[220px] z-30">
      <div className="bg-panel/70 backdrop-blur border border-edge rounded-2xl p-3">
        <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-[.2em] text-mute">Keşfet</div>
        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, Icon }) => {
            const on = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 border
                  ${on
                    ? "border-mint/40 bg-mint/5 text-bone shadow-[0_0_18px_-8px_rgba(34,197,94,.5)]"
                    : "border-transparent text-bone2 hover:text-bone hover:bg-edge/40"}`}
              >
                {on && <span className="w-1.5 h-1.5 rounded-full bg-mint shrink-0" />}
                <Icon size={16} strokeWidth={1.75} className={on ? "text-mint" : "text-mute group-hover:text-bone2"} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
          <a
            href={`mailto:${BRAND.email}`}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bone2 hover:text-bone hover:bg-edge/40 border border-transparent transition-all"
          >
            <Mail size={16} strokeWidth={1.75} className="text-mute group-hover:text-bone2" />
            İletişim
          </a>
        </nav>
      </div>
    </aside>
  );
}
