"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "INICIO" },
  { href: "/torneos", label: "TORNEOS" },
  { href: "/decks", label: "TOPS & DECKS" },
  { href: "/ranking", label: "RANKING" },
  { href: "/noticias", label: "NOTICIAS" },
  { href: "/tienda", label: "TIENDA" },
  { href: "/comunidad", label: "COMUNIDAD" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 bg-[#0a0e17] border-b border-slate-800 text-slate-100 h-16">
      {/* Navigation Links */}
      <div className="hidden lg:flex space-x-6 xl:space-x-8 text-xs font-black tracking-widest h-full">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center transition-colors h-full border-b-2 ${
                isActive
                  ? "text-yellow-400 border-yellow-400"
                  : "text-slate-400 hover:text-white border-transparent"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile Title */}
      <div className="lg:hidden flex items-center">
        <Link href="/" className="font-black italic text-lg mr-4">
          ZULIA <span className="text-yellow-400">TCG</span>
        </Link>
      </div>

      {/* Right — empty, admin is hidden from public */}
      <div />
    </nav>
  );
}
