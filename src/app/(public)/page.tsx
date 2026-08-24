import Link from "next/link";
import { Calendar, MapPin, Trophy, Users, Award, Clock } from "lucide-react";
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
    <div className="p-6 space-y-6 bg-[#05080f] min-h-screen">
      {/* ROW 1: Hero & Next Tournament */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Hero */}
        <div className="xl:col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#001736] via-[#0a0e17] to-[#040914] border border-blue-900/40 p-8 flex flex-col justify-between min-h-[350px] shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 w-full md:w-2/3">
            <span className="text-[10px] font-black tracking-widest text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">
              COMUNIDAD OFICIAL DEL ZULIA
            </span>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mt-3 mb-2 drop-shadow-lg">
              ZULIA <span className="text-yellow-400">TCG</span>
            </h1>
            <p className="text-xs font-bold text-slate-300 tracking-widest mb-8 uppercase">
              TORNEOS • TOP DECKS • RANKING • COMUNIDAD MARACAIBO
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/torneos"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all tracking-widest shadow-lg shadow-yellow-400/20"
              >
                VER PRÓXIMOS TORNEOS
              </Link>
              <Link
                href="/decks"
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-3 rounded-xl border border-slate-700 transition-colors tracking-widest"
              >
                EXPLORAR TOP DECKS
              </Link>
            </div>
          </div>
        </div>

        {/* Next Tournament Card */}
        <div className="bg-[#0a0e17] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between relative shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black tracking-wider text-yellow-400 uppercase">PRÓXIMO EVENTO</span>
            {nextTournament && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded uppercase">
                {nextTournament.tcg.name}
              </span>
            )}
          </div>

          {nextTournament ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-black italic text-white line-clamp-2">{nextTournament.name}</h3>
                <p className="text-xs text-yellow-400 font-bold mt-1">Premio: {nextTournament.prize || "Por definir"}</p>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{formatDate(nextTournament.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{nextTournament.location || "Maracaibo, Zulia"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Cupo: {nextTournament.participantsCount > 0 ? `${nextTournament.participantsCount} duelistas` : "Abierto"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 py-6">
              <Trophy className="w-12 h-12 mb-3 opacity-30 text-yellow-400" />
              <p className="font-bold text-sm text-slate-300">No hay torneos próximos programados</p>
              <p className="text-xs text-slate-500 mt-1">Pronto se anunciarán nuevas fechas oficiales.</p>
            </div>
          )}

          <Link
            href="/torneos"
            className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-3 rounded-xl text-xs transition-colors tracking-widest mt-6 shadow-lg shadow-yellow-400/20"
          >
            VER CALENDARIO
          </Link>
        </div>
      </div>

      {/* ROW 2: Ultimos Torneos, Top Decks (Cover Images), Ranking (Player Avatars) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Ultimos Torneos */}
        <div className="xl:col-span-4 bg-[#0a0e17] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> ÚLTIMO TORNEO FINALIZADO
            </h3>
            {recentTournament ? (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-28 bg-gradient-to-br from-yellow-400/20 to-slate-900 border border-yellow-400/30 rounded-xl flex flex-col items-center justify-center text-center p-2 shrink-0">
                    <Trophy className="w-6 h-6 text-yellow-400 mb-1" />
                    <span className="text-[8px] text-yellow-400/90 font-black uppercase">CAMPEÓN</span>
                    <span className="text-xs font-black text-white truncate max-w-full">
                      {recentTournament.decklists[0]?.playerName?.toUpperCase() ?? "—"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-800 text-yellow-400 uppercase">
                      {recentTournament.tcg.name}
                    </span>
                    <h4 className="font-black text-base text-white mt-1 truncate">{recentTournament.name}</h4>
                    <p className="text-[10px] text-slate-400">{formatDate(recentTournament.date)}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-semibold text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  {recentTournament.decklists.slice(0, 4).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                          i === 0 ? "bg-yellow-400 text-slate-950" : i === 1 ? "bg-slate-300 text-slate-950" : "bg-amber-600 text-white"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="truncate">{d.playerName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold truncate max-w-[120px]">{d.deckName || "Deck"}</span>
                    </div>
                  ))}
                  {recentTournament.decklists.length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-1">Sin tops cargados aún</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs text-center py-8">Sin torneos completados aún</p>
            )}
          </div>

          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
            <Link href="/torneos" className="flex-1 text-center bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-black py-2 rounded-xl transition-colors">
              RESULTADOS
            </Link>
            <Link href="/decks" className="flex-1 text-center bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-black py-2 rounded-xl transition-colors">
              TOP DECKS
            </Link>
          </div>
        </div>

        {/* Top Decks with COVER IMAGES */}
        <div className="xl:col-span-5 bg-[#0a0e17] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" /> TOP DECKS CAMPEONES
              </h3>
              <Link href="/decks" className="text-[11px] text-yellow-400 font-black hover:underline">
                VER TODOS →
              </Link>
            </div>

            {topDecks.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {topDecks.map((deck, i) => {
                  const cover = getDeckCover(deck);
                  return (
                    <Link
                      key={deck.id}
                      href="/decks"
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      {/* 3:4 Aspect Ratio Cover Thumbnail */}
                      <div className="w-full aspect-[3/4] bg-slate-900 rounded-xl border border-slate-700 group-hover:border-yellow-400 transition-all mb-2 relative overflow-hidden flex items-center justify-center shadow-lg">
                        {cover ? (
                          <img
                            src={cover}
                            alt={deck.deckName || "Deck Cover"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center p-2 text-slate-600">
                            <span className="text-[10px] font-bold block">TCG</span>
                            <span className="text-[8px]">Card</span>
                          </div>
                        )}
                        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] border-2 border-[#0a0e17] shadow ${
                          i === 0 ? "bg-yellow-400 text-slate-950" : i === 1 ? "bg-slate-300 text-slate-950" : "bg-amber-600 text-white"
                        }`}>
                          {i + 1}
                        </div>
                      </div>

                      <span className="font-black text-xs text-white text-center line-clamp-1 group-hover:text-yellow-400 transition-colors">
                        {deck.deckName || "Top Deck"}
                      </span>
                      <span className="text-[10px] font-black uppercase mt-0.5" style={{ color: deck.tcg.color || "#eab308" }}>
                        {deck.tcg.name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">TOP {deck.placement}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30 text-yellow-400" />
                No hay top decks publicados aún.
              </div>
            )}
          </div>
        </div>

        {/* Ranking Preview with AVATARS */}
        <div className="xl:col-span-3 bg-[#0a0e17] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase">RANKING GENERAL</h3>
              <Link href="/ranking" className="text-[11px] text-yellow-400 font-black hover:underline">
                VER RANKING →
              </Link>
            </div>
            <RankingPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

// Server component to compute ranking with player cover avatars
async function RankingPreview() {
  const POINTS: Record<number, number> = { 1: 100, 2: 75, 3: 50, 4: 50 };

  const decklists = await prisma.decklist.findMany({
    select: { playerName: true, placement: true, coverImageUrl: true, deckData: true },
    orderBy: { createdAt: "desc" },
  });

  const playerMap: Record<string, { pts: number; coverUrl?: string | null }> = {};
  for (const d of decklists) {
    const pts = POINTS[d.placement] ?? (d.placement <= 8 ? 25 : 0);
    if (!playerMap[d.playerName]) {
      let cover = d.coverImageUrl;
      if (!cover) {
        try {
          const parsed = JSON.parse(d.deckData);
          cover = parsed.main?.[0]?.image_url || parsed.extra?.[0]?.image_url;
        } catch (e) {}
      }
      playerMap[d.playerName] = { pts: 0, coverUrl: cover };
    }
    playerMap[d.playerName].pts += pts;
  }

  const sorted = Object.entries(playerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 5);

  if (sorted.length === 0) {
    return <p className="text-slate-500 text-xs text-center py-6">Sin datos de ranking aún</p>;
  }

  const colors = ["text-yellow-400", "text-slate-300", "text-amber-500", "text-slate-400", "text-slate-500"];

  return (
    <div className="space-y-3">
      {sorted.map((p, i) => (
        <div key={p.name} className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`font-black text-xs w-5 ${colors[i]}`}>{String(i + 1).padStart(2, "0")}</span>
            {/* Player Avatar / Deck Cover Thumbnail */}
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow">
              {p.coverUrl ? (
                <img src={p.coverUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-black text-yellow-400 uppercase">
                  {p.name.substring(0, 2)}
                </span>
              )}
            </div>
            <span className="font-bold text-xs text-white truncate max-w-[110px]">{p.name}</span>
          </div>
          <span className="text-xs text-yellow-400 font-black shrink-0">{p.pts} pts</span>
        </div>
      ))}
    </div>
  );
}
