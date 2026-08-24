import Link from "next/link";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
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

  return (
    <div className="p-6 space-y-6 bg-[#05080f] min-h-screen">
      {/* ROW 1: Hero & Next Tournament */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Hero */}
        <div className="xl:col-span-2 relative rounded-xl overflow-hidden bg-gradient-to-r from-[#001736] to-[#040914] border border-slate-800 p-8 flex flex-col justify-between min-h-[350px]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 w-full md:w-1/2">
            <h2 className="text-xl italic font-bold text-white mb-2">BIENVENIDO A</h2>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-1 drop-shadow-lg">
              ZULIA <span className="text-yellow-400">TCG</span>
            </h1>
            <p className="text-sm font-bold text-slate-300 tracking-widest mb-8">TORNEOS • DECKLISTS • RANKING • COMUNIDAD</p>
            <Link href="/torneos" className="inline-block bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold text-sm px-6 py-2 rounded transition-colors tracking-widest">
              VER PRÓXIMO TORNEO
            </Link>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 hidden md:flex items-center justify-end pr-8">
            <div className="w-64 h-80 bg-slate-800/50 rounded shadow-2xl border border-slate-700 transform rotate-12 flex items-center justify-center">
              <span className="text-slate-500 font-bold">TCG Cards</span>
            </div>
          </div>
        </div>

        {/* Proximo Torneo */}
        <div className="bg-[#0a0e17] rounded-xl border border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider">PRÓXIMO TORNEO</h3>
          </div>
          {nextTournament ? (
            <>
              <div className="flex-grow flex flex-col justify-center items-center text-center mb-6">
                <h2 className="text-4xl font-black italic text-white drop-shadow-md">{nextTournament.name}</h2>
                <span className="font-bold mt-2 text-sm" style={{ color: nextTournament.tcg.color ?? "#ffffff" }}>
                  {nextTournament.tcg.name.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300 mb-6">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" />{formatDate(nextTournament.date)}</div>
                <div className="flex items-center gap-2"><span>🕒</span>
                  {new Date(nextTournament.date).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500" />{nextTournament.location}</div>
                {nextTournament.participantsCount && (
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" />{nextTournament.participantsCount} JUG.</div>
                )}
                {nextTournament.prize && (
                  <div className="col-span-2 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" />PREMIO: {nextTournament.prize}</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500">
              <Trophy className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-bold text-sm">No hay torneos próximos</p>
              <p className="text-xs mt-1">Pronto se anunciará el siguiente</p>
            </div>
          )}
          <Link href="/torneos" className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded text-sm transition-colors tracking-widest mt-auto">
            VER DETALLES
          </Link>
        </div>
      </div>

      {/* ROW 2: Ultimos Torneos, Top Decks, Ranking */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Ultimos Torneos */}
        <div className="xl:col-span-4 bg-[#0a0e17] rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider mb-4">ÚLTIMO TORNEO</h3>
          {recentTournament ? (
            <div className="flex gap-4">
              <div className="w-32 h-40 bg-slate-800 rounded flex items-center justify-center text-center p-2 relative overflow-hidden shrink-0">
                <span className="relative z-10 text-yellow-400 font-black italic text-sm">
                  CAMPEÓN<br />
                  {recentTournament.decklists[0]?.playerName?.toUpperCase() ?? "—"}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-lg text-white">{recentTournament.name}</h4>
                <p className="text-[10px] text-slate-500 mb-3">
                  {formatDate(recentTournament.date)} • {recentTournament.participantsCount ?? "—"} JUGADORES
                </p>
                <div className="space-y-1 text-xs font-semibold text-slate-300">
                  {recentTournament.decklists.slice(0, 4).map((d, i) => (
                    <div key={d.id} className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold
                        ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-slate-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-slate-700 text-white"}`}>
                        {i + 1}
                      </span>
                      {d.playerName}
                    </div>
                  ))}
                  {recentTournament.decklists.length === 0 && (
                    <p className="text-slate-600 text-xs">Sin resultados cargados</p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href="/torneos" className="flex-1 text-center border border-blue-500 text-blue-400 text-[10px] font-bold py-1.5 rounded hover:bg-blue-500 hover:text-white transition-colors">VER RESULTADOS</Link>
                  <Link href="/decks" className="flex-1 text-center border border-slate-600 text-slate-300 text-[10px] font-bold py-1.5 rounded hover:bg-slate-600 transition-colors">VER TOP DECKS</Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">Sin torneos completados aún</p>
          )}
        </div>

        {/* Top Decks */}
        <div className="xl:col-span-5 bg-[#0a0e17] rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider mb-4">TOP DECKS</h3>
          {topDecks.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {topDecks.map((deck, i) => (
                <div key={deck.id} className="flex flex-col items-center">
                  <div className="w-full aspect-[3/4] bg-slate-800 rounded border border-slate-700 mb-2 relative">
                    <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 border-[#0a0e17]
                      ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-slate-400 text-black" : "bg-orange-700 text-white"}`}>
                      {i + 1}
                    </div>
                  </div>
                  <span className="font-bold text-xs text-white uppercase text-center leading-tight">{deck.deckName ?? "—"}</span>
                  <span className="text-[10px] font-bold mb-1" style={{ color: deck.tcg.color ?? "#ffffff" }}>{deck.tcg.name.toUpperCase()}</span>

                  <span className="text-[9px] text-slate-500">TOP {deck.placement}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">Sin decks cargados aún</p>
          )}
        </div>

        {/* Ranking Preview */}
        <div className="xl:col-span-3 bg-[#0a0e17] rounded-xl border border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider">RANKING</h3>
            <Link href="/ranking" className="text-[10px] text-blue-400 font-bold hover:text-blue-300">VER RANKING</Link>
          </div>
          <RankingPreview />
        </div>
      </div>

      {/* ROW 3: Noticias y Tienda */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 bg-[#0a0e17] rounded-xl border border-slate-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider">NOTICIAS Y ACTUALIDAD</h3>
            <Link href="/noticias" className="text-[10px] text-blue-400 font-bold hover:text-blue-300">VER TODAS</Link>
          </div>
          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {news.map((n) => {
                const tagColor = n.tag === "RESULTADOS" ? "bg-purple-600" : n.tag === "DECK PROFILE" ? "bg-blue-600" : "bg-green-600";
                return (
                  <div key={n.id} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                    <div className="h-24 bg-slate-800 relative">
                      <span className={`absolute top-2 left-2 ${tagColor} text-[8px] font-bold px-2 py-0.5 rounded text-white`}>{n.tag}</span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm text-white mb-1 line-clamp-1">{n.title}</h4>
                      <p className="text-[10px] text-slate-400 mb-2 line-clamp-2">{n.content}</p>
                      <span className="text-[9px] text-slate-500">
                        {new Date(n.createdAt).toLocaleDateString("es-VE")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">Sin noticias publicadas aún</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-[#001736] to-black rounded-xl border border-blue-900/50 p-6 flex flex-col justify-center items-start relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black italic text-yellow-400 leading-tight mb-2">VISITA NUESTRA<br /><span className="text-white">TIENDA</span></h2>
            <p className="text-[10px] font-semibold text-slate-300 w-2/3 mb-6">PLAYMATS, SLEEVES, ACCESORIOS Y MUCHO MÁS</p>
            <Link href="/tienda" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded text-sm transition-colors tracking-widest">
              IR A LA TIENDA
            </Link>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-slate-800 opacity-50 transform rotate-12 rounded"></div>
          <div className="absolute right-4 top-4 w-16 h-24 bg-slate-800 opacity-50 transform -rotate-12 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Server component to compute ranking from decklists
async function RankingPreview() {
  const POINTS: Record<number, number> = { 1: 100, 2: 75, 3: 50, 4: 50 };

  const decklists = await prisma.decklist.findMany({
    select: { playerName: true, placement: true },
  });

  const playerMap: Record<string, number> = {};
  for (const d of decklists) {
    const pts = POINTS[d.placement] ?? (d.placement <= 8 ? 25 : 0);
    playerMap[d.playerName] = (playerMap[d.playerName] ?? 0) + pts;
  }

  const sorted = Object.entries(playerMap)
    .map(([name, pts]) => ({ name, pts }))
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 5);

  if (sorted.length === 0) {
    return <p className="text-slate-500 text-xs text-center py-4">Sin datos de ranking aún</p>;
  }

  const colors = ["text-yellow-500", "text-slate-400", "text-orange-700", "text-slate-500", "text-slate-500"];

  return (
    <div className="flex flex-col gap-4 flex-grow justify-center">
      {sorted.map((p, i) => (
        <div key={p.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`font-black text-sm ${colors[i]}`}>{String(i + 1).padStart(2, "0")}</span>
            <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
            <span className="font-bold text-sm text-slate-200">{p.name}</span>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{p.pts} pts</span>
        </div>
      ))}
    </div>
  );
}
