"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "INICIO" },
  { href: "/torneos", label: "TORNEOS" },
  { href: "/decks", label: "TOPS" },
  { href: "/recomendadas", label: "RECOMENDACIONES" },
  { href: "/ranking", label: "RANKING" },
  { href: "/noticias", label: "NOTICIAS" },
  { href: "/tienda", label: "TIENDA" },
  { href: "/comunidad", label: "COMUNIDAD" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 bg-[#060a14] border-b border-slate-800 text-slate-100 h-16 shadow-xl">
      {/* Navigation Links (Desktop) */}
      <div className="hidden lg:flex space-x-6 xl:space-x-8 text-xs font-black tracking-widest h-full">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center transition-all h-full relative ${
                isActive
                  ? "text-yellow-400 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
              {isActive && (
                <div className="absolute bottom-0 inset-x-0 h-[3px] bg-yellow-400 shadow-[0_0_10px_#facc15]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile Title */}
      <div className="lg:hidden flex items-center justify-between w-full">
        <Link href="/" className="font-black italic text-xl">
          ZULIA <span className="text-yellow-400">TCG</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white border border-slate-800 bg-slate-900 rounded-sm"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-[#060a14] border-b border-slate-800 p-4 space-y-2 shadow-2xl">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2.5 px-4 text-xs font-black tracking-wider transition-colors clip-chamfer-tr ${
                  isActive
                    ? "bg-yellow-400 text-slate-950"
                    : "bg-[#0b101d] text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Right side placeholder */}
      <div className="hidden lg:block" />
    </nav>
  );
}
