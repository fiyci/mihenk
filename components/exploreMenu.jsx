import Link from "next/link";

// Dikey keşfet menüsü — masaüstünde sağda sabit, mobilde gizli.
const items = [
  { href: "/", label: "Ana Sayfa", icon: "⌂" },
  { href: "/casinos", label: "Casinolar", icon: "◆" },
  { href: "/compare", label: "Karşılaştır", icon: "⇄" },
  { href: "/blockchain", label: "Blockchain", icon: "⛓" },
  { href: "/streamers", label: "Yayıncılar", icon: "◉" },
  { href: "/sentiment", label: "Yorumlar", icon: "★" },
  { href: "/araclar", label: "Araçlar", icon: "⚙" }
];

export function ExploreMenu() {
  return (
    <aside className="hidden lg:flex flex-col gap-1 w-44 shrink-0 sticky top-20 self-start">
      <div className="panel-title px-3 mb-2">Keşfet</div>
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-mute hover:text-slate-100 hover:bg-panel border border-transparent hover:border-edge transition"
        >
          <span className="w-5 text-center text-mute group-hover:text-mint transition">{it.icon}</span>
          {it.label}
        </Link>
      ))}
    </aside>
  );
}
