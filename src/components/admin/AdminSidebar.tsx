"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Gamepad2, Trophy, Newspaper,
  ShoppingBag, Users, LogOut, ChevronRight, PenTool
} from "lucide-react";
import { logout } from "@/lib/actions"; // Keeping this import as it is used in the logout function.

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tcgs", label: "Juegos (TCGs)", icon: Gamepad2 },
  { href: "/admin/torneos", label: "Torneos", icon: Trophy },
  { href: "/admin/decks", label: "Deck Builder (Tops)", icon: PenTool },
  { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
  { href: "/admin/tienda", label: "Tienda", icon: ShoppingBag },
  { href: "/admin/comunidad", label: "Comunidad", icon: Users },
];


export function AdminSidebar() {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return null;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#0a0e17] flex-shrink-0 border-r border-slate-800 h-screen sticky top-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="block mb-1">
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            ZULIA <span className="text-yellow-400">TCG</span>
          </h1>
        </Link>
        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Panel de Administración</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${
                active
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-yellow-400" : "text-slate-500 group-hover:text-white"}`} />
              <span className="flex-grow">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 text-yellow-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 font-black text-xs">A</div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">Administrador</span>
            <span className="text-[9px] text-slate-500">Zulia TCG</span>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
