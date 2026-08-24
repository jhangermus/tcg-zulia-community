import Link from "next/link";
import { MapPin } from "lucide-react";
import { FaInstagram, FaDiscord, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { Cinzel_Decorative, Bangers, Chakra_Petch } from "next/font/google";

const ygoFont = Cinzel_Decorative({ weight: "700", subsets: ["latin"] });
const opFont = Bangers({ weight: "400", subsets: ["latin"] });
const digiFont = Chakra_Petch({ weight: "700", subsets: ["latin"] });

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#0a0e17] text-white flex-shrink-0 hidden lg:flex flex-col border-r border-slate-800 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      {/* Logo Area */}
      <div className="p-6 pb-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-md">
          ZULIA <span className="text-yellow-400">TCG</span>
        </h1>
      </div>

      {/* Location */}
      <div className="px-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <MapPin className="w-5 h-5 text-slate-300" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200 leading-tight">MARACAIBO</span>
            <span className="text-[10px] text-slate-300 font-bold">ZULIA, VENEZUELA</span>
          </div>
        </div>
      </div>

      {/* Juegos Principales */}
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 mb-4 tracking-wider">JUEGOS PRINCIPALES</h3>
        <div className="flex flex-col gap-3">
          {/* Yugioh */}
          <Link href="#" className="flex items-center gap-3 bg-gradient-to-r from-red-900/40 to-transparent p-2 rounded border border-red-900/50 hover:border-red-500 transition-colors">
            <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-300">IMG</div>
            <div className="flex flex-col flex-1">
              <span className={`font-bold text-base text-yellow-500 tracking-wider ${ygoFont.className}`}>YU-GI-OH!</span>
              <span className="text-[9px] text-slate-300 font-bold leading-tight">TORNEOS ACTIVOS</span>
            </div>
            <span className="text-xl font-bold mr-2 text-white">3</span>
          </Link>
          
          {/* One Piece */}
          <Link href="#" className="flex items-center gap-3 bg-gradient-to-r from-purple-900/40 to-transparent p-2 rounded border border-purple-900/50 hover:border-purple-500 transition-colors">
            <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-300">IMG</div>
            <div className="flex flex-col flex-1">
              <span className={`text-lg text-blue-400 tracking-wider ${opFont.className}`}>ONE PIECE</span>
              <span className="text-[9px] text-slate-300 font-bold leading-tight">TORNEOS ACTIVOS</span>
            </div>
            <span className="text-xl font-bold mr-2 text-white">2</span>
          </Link>

          {/* Digimon */}
          <Link href="#" className="flex items-center gap-3 bg-gradient-to-r from-blue-900/40 to-transparent p-2 rounded border border-blue-900/50 hover:border-blue-500 transition-colors">
            <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden flex items-center justify-center text-[8px] font-bold text-slate-300">IMG</div>
            <div className="flex flex-col flex-1">
              <span className={`font-bold text-base text-cyan-400 italic tracking-wider ${digiFont.className}`}>DIGIMON</span>
              <span className="text-[9px] text-slate-300 font-bold leading-tight">TORNEOS ACTIVOS</span>
            </div>
            <span className="text-xl font-bold mr-2 text-white">1</span>
          </Link>
        </div>
      </div>

      {/* Siguenos */}
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 mb-4 tracking-wider">SÍGUENOS</h3>
        <div className="flex flex-col gap-2">
          <Link href="#" className="flex items-center gap-3 p-2 hover:bg-slate-900 rounded group">
            <FaInstagram className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-200">INSTAGRAM</span>
              <span className="text-[10px] text-slate-300 font-bold">@zulia.tcg</span>
            </div>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-2 hover:bg-slate-900 rounded group">
            <FaDiscord className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-200">DISCORD</span>
              <span className="text-[10px] text-slate-300 font-bold">Únete a la comunidad</span>
            </div>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-2 hover:bg-slate-900 rounded group">
            <FaWhatsapp className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-200">WHATSAPP</span>
              <span className="text-[10px] text-slate-300 font-bold">Grupo de anuncios</span>
            </div>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-2 hover:bg-slate-900 rounded group">
            <FaYoutube className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-200">YOUTUBE</span>
              <span className="text-[10px] text-slate-300 font-bold">Zulia TCG</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Decorative */}
      <div className="p-6 mt-auto">
        <h2 className="text-2xl font-black italic text-yellow-400 rotate-[-5deg]">
          LA ESCENA<br/><span className="text-white text-3xl">TCG</span><br/><span className="text-blue-500">DEL ZULIA</span>
        </h2>
      </div>
    </aside>
  );
}
