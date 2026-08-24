import Link from "next/link";
import { Trophy, PenTool, LayoutTemplate, Crown, Calendar, Users, ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#05080f] border-t border-slate-800 p-4">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        
        <Link href="/torneos" className="flex items-center gap-3 group">
          <Trophy className="w-6 h-6 text-slate-500 group-hover:text-blue-500 transition-colors" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white">TORNEOS</span>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Compite y gana</span>
          </div>
        </Link>
        <div className="w-[1px] h-8 bg-slate-800 hidden md:block transform rotate-12"></div>
        
        <Link href="/noticias" className="flex items-center gap-3 group">
          <PenTool className="w-6 h-6 text-slate-500 group-hover:text-yellow-500 transition-colors" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white">NOTICIAS</span>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Actualidad TCG</span>
          </div>
        </Link>
        <div className="w-[1px] h-8 bg-slate-800 hidden md:block transform rotate-12"></div>


        <Link href="/decks" className="flex items-center gap-3 group">
          <LayoutTemplate className="w-6 h-6 text-slate-500 group-hover:text-blue-500 transition-colors" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white">DECKS</span>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Explora metas</span>
          </div>
        </Link>
        <div className="w-[1px] h-8 bg-slate-800 hidden md:block transform rotate-12"></div>

        <Link href="/ranking" className="flex items-center gap-3 group">
          <Crown className="w-6 h-6 text-slate-500 group-hover:text-yellow-500 transition-colors" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white">RANKING</span>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Mide tu nivel</span>
          </div>
        </Link>
        <div className="w-[1px] h-8 bg-slate-800 hidden md:block transform rotate-12"></div>

        <Link href="/tienda" className="flex items-center gap-3 group">
          <ShoppingBag className="w-6 h-6 text-slate-500 group-hover:text-purple-500 transition-colors" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white">TIENDA</span>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Accesorios y singles</span>
          </div>
        </Link>
        <div className="w-[1px] h-8 bg-slate-800 hidden md:block transform rotate-12"></div>

        <Link href="/comunidad" className="flex items-center gap-3 group">
          <Users className="w-6 h-6 text-slate-500 group-hover:text-green-500 transition-colors" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white">COMUNIDAD</span>
            <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Conecta con otros</span>
          </div>
        </Link>

      </div>
    </footer>
  );
}
