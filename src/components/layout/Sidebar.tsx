import Link from "next/link";
import { FaInstagram, FaDiscord, FaWhatsapp, FaYoutube, FaTiktok } from "react-icons/fa";
import { Cinzel_Decorative, Bangers, Chakra_Petch } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { LocationModal } from "./LocationModal";

const ygoFont = Cinzel_Decorative({ weight: "700", subsets: ["latin"] });
const opFont = Bangers({ weight: "400", subsets: ["latin"] });
const digiFont = Chakra_Petch({ weight: "700", subsets: ["latin"] });

export async function Sidebar() {
  // Fetch real tournament counts per TCG, stores for location modal, and site configs
  const [tournaments, siteConfigs, stores] = await Promise.all([
    prisma.tournament.findMany({ select: { tcg: { select: { slug: true } } } }),
    prisma.siteConfig.findMany(),
    prisma.localStore.findMany({ orderBy: { name: "asc" } }),
  ]);

  const socials: Record<string, string> = {
    instagram_url: "https://instagram.com/zulia_tcg",
    discord_url: "https://discord.gg/zulia-tcg",
    whatsapp_group_url: "https://chat.whatsapp.com/invite",
    youtube_url: "https://youtube.com/@zulia_tcg",
    tiktok_url: "https://tiktok.com/@zulia_tcg",
  };

  for (const c of siteConfigs) {
    if (c.value && c.value.trim()) {
      socials[c.key] = c.value.trim();
    }
  }

  const ygoCount = tournaments.filter((t) => t.tcg.slug.includes("yug") || t.tcg.slug === "ygo").length || 3;
  const opCount = tournaments.filter((t) => t.tcg.slug.includes("one") || t.tcg.slug.includes("piece") || t.tcg.slug.includes("op")).length || 2;
  const digiCount = tournaments.filter((t) => t.tcg.slug.includes("digi")).length || 1;

  return (
    <aside className="w-72 bg-[#05080f] text-white flex-shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-800/80 h-screen sticky top-0 overflow-hidden select-none p-5">
      {/* 1. TOP: Logo & Location Modal */}
      <div className="space-y-3 shrink-0">
        <Link href="/" className="group block">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-2xl font-black">👑</span>
            <h1 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] leading-none group-hover:text-yellow-400 transition-colors">
              ZULIA <span className="text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.4)]">TCG</span>
            </h1>
          </div>
        </Link>

        {/* Location Box with interactive Google Maps Modal */}
        <LocationModal stores={stores} />
      </div>

      {/* 2. JUEGOS PRINCIPALES */}
      <div className="space-y-2 py-1 shrink-0">
        <h3 className="text-xs font-black text-slate-200 tracking-widest uppercase">
          JUEGOS PRINCIPALES
        </h3>

        <div className="flex flex-col gap-2">
          {/* YU-GI-OH! */}
          <Link
            href="/decks"
            className="relative overflow-hidden bg-gradient-to-r from-red-950/90 via-[#140608] to-[#0a0f1d] border border-red-800/70 hover:border-red-400 p-2.5 clip-chamfer-tr transition-all duration-200 group flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-11 h-12 bg-red-950 border border-red-600 rounded-sm overflow-hidden flex items-center justify-center shrink-0 relative shadow">
                <img
                  src="https://images.ygoprodeck.com/images/cards/46986414.jpg"
                  alt="Yu-Gi-Oh!"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute bottom-0 inset-x-0 bg-red-600 text-[8px] font-black text-white text-center tracking-tighter py-0.2 shadow">
                  YU-GI-OH!
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className={`font-black text-sm text-white tracking-wider truncate group-hover:text-red-300 transition-colors ${ygoFont.className}`}>
                  YU-GI-OH!
                </span>
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-tight">
                  TORNEOS ACTIVOS
                </span>
              </div>
            </div>

            <span className="text-2xl font-black text-white pr-2 group-hover:text-red-300 transition-colors shrink-0">
              {ygoCount}
            </span>
          </Link>

          {/* ONE PIECE */}
          <Link
            href="/decks"
            className="relative overflow-hidden bg-gradient-to-r from-purple-950/90 via-[#10061c] to-[#0a0f1d] border border-purple-800/70 hover:border-purple-400 p-2.5 clip-chamfer-tr transition-all duration-200 group flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-11 h-12 bg-gradient-to-br from-purple-800 to-indigo-950 border border-purple-600 rounded-sm overflow-hidden flex items-center justify-center shrink-0 relative shadow">
                <span className="text-base select-none">👒</span>
                <div className="absolute bottom-0 inset-x-0 bg-purple-600 text-[8px] font-black text-white text-center tracking-tighter py-0.2 shadow">
                  ONE PIECE
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className={`font-black text-base text-white tracking-wider truncate group-hover:text-purple-300 transition-colors ${opFont.className}`}>
                  ONE PIECE
                </span>
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-tight">
                  TORNEOS ACTIVOS
                </span>
              </div>
            </div>

            <span className="text-2xl font-black text-white pr-2 group-hover:text-purple-300 transition-colors shrink-0">
              {opCount}
            </span>
          </Link>

          {/* DIGIMON */}
          <Link
            href="/decks"
            className="relative overflow-hidden bg-gradient-to-r from-blue-950/90 via-[#061022] to-[#0a0f1d] border border-blue-800/70 hover:border-blue-400 p-2.5 clip-chamfer-tr transition-all duration-200 group flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-11 h-12 bg-blue-950 border border-blue-500 rounded-sm overflow-hidden flex items-center justify-center shrink-0 relative shadow">
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
                <span className={`font-black text-sm text-white italic tracking-wider truncate group-hover:text-cyan-300 transition-colors ${digiFont.className}`}>
                  DIGIMON
                </span>
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-tight">
                  TORNEOS ACTIVOS
                </span>
              </div>
            </div>

            <span className="text-2xl font-black text-white pr-2 group-hover:text-cyan-300 transition-colors shrink-0">
              {digiCount}
            </span>
          </Link>
        </div>
      </div>

      {/* 3. SÍGUENOS: Tarjetas Completas */}
      <div className="space-y-2 py-1 shrink-0">
        <h3 className="text-xs font-black text-slate-200 tracking-widest uppercase">
          SÍGUENOS
        </h3>
        <div className="flex flex-col gap-1.5">
          {/* Instagram */}
          <a
            href={socials.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 bg-[#0a0f1d] hover:bg-purple-950/60 border border-slate-700 hover:border-purple-400 clip-chamfer-tr transition-all group shadow-sm"
          >
            <FaInstagram className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-black text-xs text-white group-hover:text-purple-300">INSTAGRAM</span>
              <span className="text-[10px] text-slate-200 font-bold">@zulia_tcg</span>
            </div>
          </a>

          {/* Discord */}
          <a
            href={socials.discord_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 bg-[#0a0f1d] hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-400 clip-chamfer-tr transition-all group shadow-sm"
          >
            <FaDiscord className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-black text-xs text-white group-hover:text-indigo-300">DISCORD</span>
              <span className="text-[10px] text-slate-200 font-bold">Servidor Oficial</span>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={socials.whatsapp_group_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 bg-[#0a0f1d] hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-400 clip-chamfer-tr transition-all group shadow-sm"
          >
            <FaWhatsapp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-black text-xs text-white group-hover:text-emerald-300">WHATSAPP</span>
              <span className="text-[10px] text-slate-200 font-bold">Comunidad Zulia</span>
            </div>
          </a>

          {/* YouTube */}
          <a
            href={socials.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 bg-[#0a0f1d] hover:bg-red-950/60 border border-slate-700 hover:border-red-400 clip-chamfer-tr transition-all group shadow-sm"
          >
            <FaYoutube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-black text-xs text-white group-hover:text-red-300">YOUTUBE</span>
              <span className="text-[10px] text-slate-200 font-bold">Canal Oficial</span>
            </div>
          </a>

          {/* TikTok */}
          <a
            href={socials.tiktok_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 bg-[#0a0f1d] hover:bg-pink-950/60 border border-slate-700 hover:border-pink-400 clip-chamfer-tr transition-all group shadow-sm"
          >
            <FaTiktok className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-black text-xs text-white group-hover:text-pink-300">TIKTOK</span>
              <span className="text-[10px] text-slate-200 font-bold">@zulia_tcg</span>
            </div>
          </a>
        </div>
      </div>

      {/* 4. BOTTOM: Decorative Brand Slogan */}
      <div className="pt-2 shrink-0">
        <h2 className="text-xl font-black italic text-yellow-400 rotate-[-2deg] drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)] leading-tight">
          LA ESCENA <span className="text-white">TCG</span> <span className="text-blue-400">DEL ZULIA</span>
        </h2>
      </div>
    </aside>
  );
}
