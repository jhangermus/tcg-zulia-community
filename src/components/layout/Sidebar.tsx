import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import { FaInstagram, FaDiscord, FaWhatsapp, FaYoutube, FaTiktok } from "react-icons/fa";
import { Cinzel_Decorative, Bangers, Chakra_Petch } from "next/font/google";
import { prisma } from "@/lib/prisma";

const ygoFont = Cinzel_Decorative({ weight: "700", subsets: ["latin"] });
const opFont = Bangers({ weight: "400", subsets: ["latin"] });
const digiFont = Chakra_Petch({ weight: "700", subsets: ["latin"] });

export async function Sidebar() {
  // Fetch real tournament counts per TCG
  const [tournaments, siteConfigs] = await Promise.all([
    prisma.tournament.findMany({ select: { tcg: { select: { slug: true } } } }),
    prisma.siteConfig.findMany(),
  ]);

  const socials: Record<string, string> = {};
  for (const c of siteConfigs) {
    socials[c.key] = c.value;
  }

  const ygoCount = tournaments.filter((t) => t.tcg.slug.includes("yug") || t.tcg.slug === "ygo").length || 3;
  const opCount = tournaments.filter((t) => t.tcg.slug.includes("one") || t.tcg.slug.includes("piece") || t.tcg.slug.includes("op")).length || 2;
  const digiCount = tournaments.filter((t) => t.tcg.slug.includes("digi")).length || 1;

  return (
    <aside className="w-64 bg-[#05080f] text-white flex-shrink-0 hidden lg:flex flex-col border-r border-slate-800/80 h-screen sticky top-0 overflow-y-auto custom-scrollbar select-none">
      {/* Logo Area */}
      <div className="p-6 pb-4">
        <Link href="/" className="group block">
          <div className="flex items-center gap-2">
            {/* Crown Icon */}
            <span className="text-yellow-400 text-2xl font-black">👑</span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] leading-none mt-1 group-hover:text-yellow-400 transition-colors">
            ZULIA <span className="text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.4)]">TCG</span>
          </h1>
        </Link>
      </div>

      {/* Location Box (Tactical Chamfered) */}
      <div className="px-6 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3 bg-[#0a0f1d] p-3 border border-slate-700/80 clip-chamfer-tr hover:border-slate-500 transition-colors">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-100 tracking-wider">MARACAIBO</span>
            <span className="text-[9px] text-slate-400 font-bold tracking-tight">ZULIA, VENEZUELA</span>
          </div>
        </div>
      </div>

      {/* Juegos Principales (Tactical Gaming Cards) */}
      <div className="p-6 border-b border-slate-800/80 space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
          JUEGOS PRINCIPALES
        </h3>

        <div className="flex flex-col gap-2.5">
          {/* YU-GI-OH! CARD */}
          <Link
            href="/decks"
            className="relative overflow-hidden bg-gradient-to-r from-red-950/80 via-[#120608] to-[#0a0f1d] border border-red-800/60 hover:border-red-500 p-2.5 clip-chamfer-tr transition-all duration-200 group flex items-center justify-between shadow-lg hover:shadow-red-950/40"
          >
            {/* Character art preview / background */}
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-11 h-12 bg-red-950 border border-red-600/60 rounded-sm overflow-hidden flex items-center justify-center shrink-0 relative shadow">
                <img
                  src="https://images.ygoprodeck.com/images/cards/46986414.jpg"
                  alt="Yu-Gi-Oh!"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                {/* Diagonal Ribbon Tag */}
                <div className="absolute bottom-0 inset-x-0 bg-red-600 text-[8px] font-black text-white text-center tracking-tighter py-0.2 shadow">
                  YU-GI-OH!
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className={`font-black text-sm text-white tracking-wider truncate group-hover:text-red-400 transition-colors ${ygoFont.className}`}>
                  YU-GI-OH!
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                  TORNEOS ACTIVOS
                </span>
              </div>
            </div>

            <span className="text-xl font-black text-white pr-2 group-hover:text-red-400 transition-colors shrink-0">
              {ygoCount}
            </span>
          </Link>

          {/* ONE PIECE CARD */}
          <Link
            href="/decks"
            className="relative overflow-hidden bg-gradient-to-r from-purple-950/80 via-[#0e0618] to-[#0a0f1d] border border-purple-800/60 hover:border-purple-500 p-2.5 clip-chamfer-tr transition-all duration-200 group flex items-center justify-between shadow-lg hover:shadow-purple-950/40"
          >
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-11 h-12 bg-purple-950 border border-purple-600/60 rounded-sm overflow-hidden flex items-center justify-center shrink-0 relative shadow">
                <img
                  src="https://limitlesstcg.s3.us-east-2.amazonaws.com/one-piece/OP01/OP01-001.webp"
                  alt="One Piece"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute bottom-0 inset-x-0 bg-purple-600 text-[8px] font-black text-white text-center tracking-tighter py-0.2 shadow">
                  ONE PIECE
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className={`font-black text-base text-white tracking-wider truncate group-hover:text-purple-300 transition-colors ${opFont.className}`}>
                  ONE PIECE
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                  TORNEOS ACTIVOS
                </span>
              </div>
            </div>

            <span className="text-xl font-black text-white pr-2 group-hover:text-purple-300 transition-colors shrink-0">
              {opCount}
            </span>
          </Link>

          {/* DIGIMON CARD */}
          <Link
            href="/decks"
            className="relative overflow-hidden bg-gradient-to-r from-blue-950/80 via-[#060e1c] to-[#0a0f1d] border border-blue-800/60 hover:border-blue-400 p-2.5 clip-chamfer-tr transition-all duration-200 group flex items-center justify-between shadow-lg hover:shadow-blue-950/40"
          >
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-11 h-12 bg-blue-950 border border-blue-500/60 rounded-sm overflow-hidden flex items-center justify-center shrink-0 relative shadow">
                <img
                  src="https://images.digimoncard.io/images/cards/BT1-025.jpg"
                  alt="Digimon"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute bottom-0 inset-x-0 bg-blue-600 text-[8px] font-black text-white text-center tracking-tighter py-0.2 shadow">
                  DIGIMON
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className={`font-black text-sm text-white italic tracking-wider truncate group-hover:text-cyan-400 transition-colors ${digiFont.className}`}>
                  DIGIMON
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                  TORNEOS ACTIVOS
                </span>
              </div>
            </div>

            <span className="text-xl font-black text-white pr-2 group-hover:text-cyan-400 transition-colors shrink-0">
              {digiCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Siguenos */}
      <div className="p-6 border-b border-slate-800/80 space-y-2">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">
          SÍGUENOS
        </h3>
        <div className="flex flex-col gap-1.5">
          {socials.instagram_url && (
            <a
              href={socials.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 bg-[#090d18] hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 clip-chamfer-tr transition-all group"
            >
              <FaInstagram className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black text-[11px] text-slate-200 group-hover:text-purple-300">INSTAGRAM</span>
                <span className="text-[9px] text-slate-500 font-bold">@zulia_tcg</span>
              </div>
            </a>
          )}

          {socials.discord_url && (
            <a
              href={socials.discord_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 bg-[#090d18] hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 clip-chamfer-tr transition-all group"
            >
              <FaDiscord className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black text-[11px] text-slate-200 group-hover:text-indigo-300">DISCORD</span>
                <span className="text-[9px] text-slate-500 font-bold">Servidor Oficial</span>
              </div>
            </a>
          )}

          {socials.whatsapp_group_url && (
            <a
              href={socials.whatsapp_group_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 bg-[#090d18] hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 clip-chamfer-tr transition-all group"
            >
              <FaWhatsapp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black text-[11px] text-slate-200 group-hover:text-emerald-300">WHATSAPP</span>
                <span className="text-[9px] text-slate-500 font-bold">Comunidad Zulia</span>
              </div>
            </a>
          )}

          {socials.youtube_url && (
            <a
              href={socials.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 bg-[#090d18] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/50 clip-chamfer-tr transition-all group"
            >
              <FaYoutube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-black text-[11px] text-slate-200 group-hover:text-red-300">YOUTUBE</span>
                <span className="text-[9px] text-slate-500 font-bold">Canal Oficial</span>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Decorative Brand Block */}
      <div className="p-6 mt-auto">
        <h2 className="text-2xl font-black italic text-yellow-400 rotate-[-3deg] drop-shadow-[0_2px_8px_rgba(250,204,21,0.3)]">
          LA ESCENA<br />
          <span className="text-white text-3xl">TCG</span><br />
          <span className="text-blue-400">DEL ZULIA</span>
        </h2>
      </div>
    </aside>
  );
}
