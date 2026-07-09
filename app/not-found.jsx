import Link from "next/link";
import { BRAND } from "../lib/brand";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-28 text-center">
      <div className="font-mono text-6xl text-edge mb-4">404</div>
      <h1 className="text-2xl font-bold text-bone">Sayfa bulunamadı</h1>
      <p className="text-mute text-sm mt-2">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Link href="/" className="inline-block mt-6 bg-mint text-ink font-semibold text-sm rounded-lg px-4 py-2 hover:opacity-90 transition">
        {BRAND.name} ana sayfasına dön
      </Link>
    </div>
  );
}
