import Link from "next/link";
import { Calendar, MapPin, Trophy, Users, Award, Flame, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [nextTournament, recentTournament, topDecks, news] = await Promise.all([
    prisma.tournament.findFirst({
      where: { status: "UPCOMING" },
      include: { tcg: true },
      orderBy: { date: "asc" },
    }),
    prisma.tournament.findFirst({
      where: { status: "COMPLETED" },
      include: { tcg: true, decklists: { orderBy: { placement: "asc" }, take: 4 } },
      orderBy: { date: "desc" },
    }),
    prisma.decklist.findMany({
      include: { tcg: true },
      orderBy: [{ placement: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("es-VE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();

  // Helper to extract cover image from deck
  const getDeckCover = (deck: { coverImageUrl?: string | null; deckData: string }) => {
    if (deck.coverImageUrl) return deck.coverImageUrl;
    try {
      const parsed = JSON.parse(deck.deckData);
      if (parsed.main && parsed.main[0]?.image_url) return parsed.main[0].image_url;
      if (parsed.extra && parsed.extra[0]?.image_url) return parsed.extra[0].image_url;
    } catch (e) {}
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#04070d] min-h-screen bg-tactical-grid">
      {/* ROW 1: Hero & Next Tournament */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Hero Banner (Tactical Chamfered with HUD accents) */}
        <div className="xl:col-span-2 relative overflow-hidden bg-gradient-to-r from-[#001736] via-[#090f1d] to-[#04070d] border border-blue-900/60 p-8 md:p-10 flex flex-col justify-between min-h-[360px] clip-chamfer-tr shadow-2xl hud-box hud-bracket-cyan">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 w-full md:w-4/5 space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 px-3.5 py-1.5 text-xs font-black tracking-widest uppercase clip-tag-angled shadow">
              <span>★ COMUNIDAD OFICIAL ZULIA ★</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] leading-none">
              ZULIA <span className="text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">TCG</span>
            </h1>

            <p className="text-sm font-black text-slate-200 tracking-wider uppercase">
              TORNEOS • TOP DECKS • RANKING • COMUNIDAD MARACAIBO
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/torneos"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-sm px-7 py-3.5 transition-all tracking-widest clip-btn-tactical shadow-lg shadow-yellow-400/20 hover:scale-105"
              >
                VER PRÓXIMOS TORNEOS
              </Link>
              <Link
                href="/decks"
                className="bg-[#0b1222] hover:bg-slate-800 text-white font-black text-sm px-7 py-3.5 border border-slate-700 hover:border-slate-500 transition-all tracking-widest clip-btn-tactical"
              >
                EXPLORAR TOP DECKS
              </Link>
            </div>
          </div>
        </div>

        {/* Next Tournament Card (Tactical Chamfered) */}
        <div className="bg-[#070b14] border border-slate-800 p-6 md:p-8 flex flex-col justify-between relative shadow-xl clip-chamfer-tr hud-box hud-bracket-yellow">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black tracking-widest text-yellow-400 uppercase">
                PRÓXIMO EVENTO
              </span>
              {nextTournament && (
                <span className="text-[11px] font-black px-3 py-1 bg-yellow-400/10 border border-yellow-400/40 text-yellow-400 uppercase clip-tag-angled">
                  {nextTournament.tcg.name}
                </span>
              )}
            </div>

            {nextTournament ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black italic text-white line-clamp-2 leading-tight">
                    {nextTournament.name}
                  </h3>
                  <p className="text-sm text-yellow-400 font-black mt-1">Premio: {nextTournament.prize || "Por definir"}</p>
                </div>

                <div className="space-y-2.5 text-sm font-bold text-slate-200 bg-[#0c1220] p-4 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>{formatDate(nextTournament.date)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>{nextTournament.location || "Maracaibo, Zulia"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Cupo: {nextTournament.participantsCount > 0 ? `${nextTournament.participantsCount} duelistas` : "Abierto"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-300 py-6">
                <Trophy className="w-12 h-12 mb-3 opacity-40 text-yellow-400" />
                <p className="font-black text-base text-white">No hay torneos próximos programados</p>
                <p className="text-xs text-slate-300 mt-1 font-semibold">Pronto se anunciarán nuevas fechas oficiales.</p>
              </div>
            )}
          </div>

          <Link
            href="/torneos"
            className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-3.5 text-sm transition-colors tracking-widest mt-6 clip-btn-tactical shadow-lg shadow-yellow-400/20"
          >
            VER CALENDARIO
          </Link>
        </div>
      </div>

      {/* ROW 2: Ultimos Torneos, Top Decks (Tactical HUD), Ranking */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Ultimo Torneo (Larger Typography & High Contrast) */}
        <div className="xl:col-span-4 bg-[#070b14] border border-slate-800 p-6 md:p-7 flex flex-col justify-between shadow-xl clip-chamfer-tr">
          <div>
            <h3 className="text-xs font-black text-slate-200 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> ÚLTIMO TORNEO FINALIZADO
            </h3>
            {recentTournament ? (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-28 bg-gradient-to-br from-yellow-400/20 via-slate-900 to-slate-950 border border-yellow-400/40 clip-chamfer-tr flex flex-col items-center justify-center text-center p-2 shrink-0 shadow">
                    <Trophy className="w-7 h-7 text-yellow-400 mb-1" />
                    <span className="text-[9px] text-yellow-400 font-black uppercase">CAMPEÓN</span>
                    <span className="text-sm font-black text-white truncate max-w-full">
                      {recentTournament.decklists[0]?.playerName?.toUpperCase() ?? "—"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black px-2.5 py-0.5 bg-slate-800 text-yellow-400 uppercase clip-tag-angled">
                      {recentTournament.tcg.name}
                    </span>
                    <h4 className="font-black text-lg text-white mt-1 truncate">{recentTournament.name}</h4>
                    <p className="text-xs text-slate-300 font-bold">{formatDate(recentTournament.date)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm font-bold text-slate-100 bg-[#0c1220] p-4 border border-slate-800">
                  {recentTournament.decklists.slice(0, 4).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-black ${
                          i === 0 ? "bg-yellow-400 text-slate-950" : i === 1 ? "bg-slate-300 text-slate-950" : "bg-amber-600 text-white"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="truncate font-black text-white">{d.playerName}</span>
                      </div>
                      <span className="text-xs text-slate-300 font-bold truncate max-w-[130px]">{d.deckName || "Deck"}</span>
                    </div>
                  ))}
                  {recentTournament.decklists.length === 0 && (
                    <p className="text-slate-300 text-xs text-center py-1">Sin tops cargados aún</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-300 text-sm text-center py-8">Sin torneos completados aún</p>
            )}
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
            <Link href="/torneos" className="flex-1 text-center bg-[#0c1220] hover:bg-slate-800 border border-slate-700 text-white text-xs font-black py-3 transition-colors clip-btn-tactical">
              RESULTADOS
            </Link>
            <Link href="/decks" className="flex-1 text-center bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-black py-3 transition-colors clip-btn-tactical">
              TOP DECKS
            </Link>
          </div>
        </div>

        {/* Top Decks with LARGER TYPOGRAPHY, CHAMFERED CORNERS and COVER ART */}
        <div className="xl:col-span-5 bg-[#070b14] border border-slate-800 p-6 md:p-7 flex flex-col justify-between shadow-xl clip-chamfer-tr hud-box hud-bracket-cyan">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-200 tracking-widest uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" /> TOP DECKS
              </h3>
              <Link href="/decks" className="text-xs text-yellow-400 font-black hover:underline">
                VER TODOS →
              </Link>
            </div>

            {topDecks.length > 0 ? (
              <div className="grid grid-cols-3 gap-3.5">
                {topDecks.map((deck, i) => {
                  const cover = getDeckCover(deck);
                  return (
                    <Link
                      key={deck.id}
                      href="/decks"
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      {/* Tactical Chamfered 3:4 Card Container */}
                      <div className="w-full aspect-[3/4] bg-[#0c1220] border border-slate-700 group-hover:border-yellow-400 transition-all mb-2.5 relative overflow-hidden flex items-center justify-center shadow-lg clip-chamfer-tr">
                        {cover ? (
                          <img
                            src={cover}
                            alt={deck.deckName || "Deck Cover"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center p-2 text-slate-300">
                            <span className="text-xs font-black block">TCG</span>
                            <span className="text-[9px] font-bold">CARD</span>
                          </div>
                        )}
                        {/* Position Badge with Angular Tag */}
                        <div className={`absolute top-0 left-0 px-2.5 py-0.5 font-black text-xs shadow clip-tag-angled ${
                          i === 0 ? "bg-yellow-400 text-slate-950" : i === 1 ? "bg-slate-300 text-slate-950" : "bg-amber-600 text-white"
                        }`}>
                          #{i + 1}
                        </div>
                      </div>

                      <span className="font-black text-sm text-white text-center line-clamp-1 group-hover:text-yellow-400 transition-colors">
                        {deck.deckName || "Top Deck"}
                      </span>
                      <span className="text-[11px] font-black uppercase mt-0.5 text-yellow-400">
                        {deck.tcg.name}
                      </span>
                      <span className="text-xs text-slate-200 font-bold">TOP {deck.placement}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-300 text-sm font-semibold">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40 text-yellow-400" />
                No hay top decks publicados aún.
              </div>
            )}
          </div>
        </div>

        {/* Ranking Preview with LARGER TYPOGRAPHY */}
        <div className="xl:col-span-3 bg-[#070b14] border border-slate-800 p-6 md:p-7 flex flex-col justify-between shadow-xl clip-chamfer-tr">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-200 tracking-widest uppercase">RANKING</h3>
              <Link href="/ranking" className="text-xs text-yellow-400 font-black hover:underline">
                VER RANKING
              </Link>
            </div>
            <RankingPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

// Server component to compute ranking with player cover avatars & clickable profile links
async function RankingPreview() {
  const POINTS: Record<number, number> = { 1: 100, 2: 75, 3: 50, 4: 50 };

  const decklists = await prisma.decklist.findMany({
    where: { isRecommended: false, placement: { gt: 0 } },
    select: { playerName: true, placement: true, coverImageUrl: true, deckData: true },
    orderBy: { createdAt: "desc" },
  });

  const playerMap: Record<string, { pts: number; coverUrl?: string | null }> = {};
  for (const d of decklists) {
    const rawName = d.playerName.trim();
    if (!rawName) continue;
    const pts = POINTS[d.placement] ?? (d.placement <= 8 ? 25 : 10);
    if (!playerMap[rawName]) {
      let cover = d.coverImageUrl;
      if (!cover) {
        try {
          const parsed = JSON.parse(d.deckData);
          cover = parsed.main?.[0]?.image_url || parsed.extra?.[0]?.image_url;
        } catch (e) {}
      }
      playerMap[rawName] = { pts: 0, coverUrl: cover };
    }
    playerMap[rawName].pts += pts;
  }

  const sorted = Object.entries(playerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 5);

  if (sorted.length === 0) {
    return <p className="text-slate-300 text-sm text-center py-6 font-semibold">Sin datos de ranking aún</p>;
  }

  const colors = ["text-yellow-400", "text-slate-200", "text-amber-400", "text-slate-300", "text-slate-400"];

  return (
    <div className="space-y-3.5">
      {sorted.map((p, i) => (
        <Link
          key={p.name}
          href={`/jugador/${encodeURIComponent(p.name)}`}
          className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2 hover:bg-slate-800/30 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={`font-black text-sm w-6 ${colors[i]}`}>{String(i + 1).padStart(2, "0")}</span>
            {/* Player Avatar / Deck Cover Thumbnail */}
            <div className="w-9 h-9 rounded-sm bg-[#0c1220] border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow">
              {p.coverUrl ? (
                <img src={p.coverUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              ) : (
                <span className="text-xs font-black text-yellow-400 uppercase">
                  {p.name.substring(0, 2)}
                </span>
              )}
            </div>
            <span className="font-black text-sm text-white group-hover:text-yellow-400 transition-colors truncate max-w-[120px]">
              {p.name}
            </span>
          </div>
          <span className="text-sm text-yellow-400 font-black shrink-0">{p.pts} pts</span>
        </Link>
      ))}
    </div>
  );
}
