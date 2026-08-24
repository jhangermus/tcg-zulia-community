"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, Wrench } from "lucide-react";

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

      {/* Right Actions */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-yellow-400 transition-colors border border-slate-800 hover:border-yellow-400/40 px-3 py-1.5 rounded-lg"
          title="Panel Admin"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ADMIN</span>
        </Link>
        <Link
          href="/admin/login"
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs px-5 py-2 rounded transition-colors tracking-widest"
        >
          INICIAR SESIÓN
        </Link>
      </div>
    </nav>
  );
}
