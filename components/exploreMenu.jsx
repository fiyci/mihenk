import Link from "next/link";
import { Home, Diamond, GitCompareArrows, Link2, Radio, Star, Wrench } from "lucide-react";

// Dikey keşfet menüsü — masaüstünde sağda sabit, mobilde gizli.
const items = [
  { href: "/", label: "Ana Sayfa", Icon: Home },
  { href: "/casinos", label: "Casinolar", Icon: Diamond },
  { href: "/compare", label: "Karşılaştır", Icon: GitCompareArrows },
  { href: "/blockchain", label: "Blockchain", Icon: Link2 },
  { href: "/streamers", label: "Yayıncılar", Icon: Radio },
  { href: "/sentiment", label: "Yorumlar", Icon: Star },
  { href: "/araclar", label: "Araçlar", Icon: Wrench }
];

export function ExploreMenu() {
  return (
    <aside className="hidden lg:flex flex-col gap-1 w-44 shrink-0 sticky top-20 self-start">
      <div className="panel-title px-3 mb-2">Keşfet</div>
      {items.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-mute hover:text-bone hover:bg-panel border border-transparent hover:border-edge transition"
        >
          <Icon size={16} strokeWidth={1.75} className="text-mute group-hover:text-mint transition-colors" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
