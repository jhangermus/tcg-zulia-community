import { Crown, Flame, Trophy, Award } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const POINTS: Record<number, number> = { 1: 100, 2: 75, 3: 50, 4: 50 };

export default async function RankingPage() {
  const decklists = await prisma.decklist.findMany({
    include: { tcg: true },
    orderBy: { createdAt: "desc" },
  });

  // Build ranking from decklists with player cover avatars
  const playerMap: Record<
    string,
    { pts: number; tops: number; mainTcg: string; coverUrl?: string | null }
  > = {};

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
      playerMap[d.playerName] = {
        pts: 0,
        tops: 0,
        mainTcg: d.tcg.name,
        coverUrl: cover,
      };
    }
    playerMap[d.playerName].pts += pts;
    playerMap[d.playerName].tops += 1;
  }

  const ranking = Object.entries(playerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.pts - a.pts)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            RANKING DE <span className="text-yellow-400">JUGADORES</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Tabla de clasificación general de la comunidad de TCG en el Estado Zulia (Temporada activa).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-300">
          <Flame className="w-4 h-4 text-orange-500" /> TEMPORADA ACTIVA
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Crown className="w-16 h-16 mx-auto mb-4 opacity-20 text-yellow-400" />
          <p className="font-bold text-lg text-white">El ranking se construirá automáticamente</p>
          <p className="text-xs text-slate-400 mt-1">
            Cada vez que se registre un top deck en los torneos oficiales se sumarán puntos para la tabla.
          </p>
        </div>
      ) : (
        <>
          {/* Podium Top 3 */}
          {ranking.length >= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* 2nd Place */}
              <div className="order-2 md:order-1 bg-[#0a0e17] border border-slate-700/60 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-400 overflow-hidden flex items-center justify-center font-black text-2xl text-slate-300 mb-3 shadow-lg relative">
                  {ranking[1]?.coverUrl ? (
                    <img src={ranking[1].coverUrl} alt="2nd" className="w-full h-full object-cover" />
                  ) : (
                    <span>2</span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[10px] font-black text-slate-300 py-0.5">
                    #2
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SUB-CAMPEÓN</span>
                <h3 className="text-2xl font-black text-white mt-1">{ranking[1]?.name ?? "—"}</h3>
                <p className="text-xs font-bold text-slate-400 mb-4">{ranking[1]?.mainTcg ?? ""}</p>
                {ranking[1] && (
                  <div className="w-full bg-slate-900/80 rounded-xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                    <div><p className="text-slate-500 font-bold text-[9px]">PUNTOS</p><p className="font-black text-white text-base">{ranking[1].pts}</p></div>
                    <div><p className="text-slate-500 font-bold text-[9px]">TOPS</p><p className="font-black text-white text-base">{ranking[1].tops}</p></div>
                  </div>
                )}
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2 bg-gradient-to-b from-yellow-400/15 via-[#0a0e17] to-[#0a0e17] border-2 border-yellow-400/60 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl scale-105">
                <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-[#0a0e17] overflow-hidden flex items-center justify-center font-black text-3xl text-slate-950 mb-3 shadow-yellow-400/30 shadow-lg relative">
                  {ranking[0]?.coverUrl ? (
                    <img src={ranking[0].coverUrl} alt="1st" className="w-full h-full object-cover" />
                  ) : (
                    <Crown className="w-10 h-10 text-slate-950" />
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-yellow-400 text-[10px] font-black text-slate-950 py-0.5">
                    #1
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-0.5 rounded-full">
                  NÚMERO 1 DEL ZULIA
                </span>
                <h3 className="text-3xl font-black text-white mt-2">{ranking[0].name}</h3>
                <p className="text-xs font-bold text-yellow-400 mb-4">{ranking[0].mainTcg}</p>
                <div className="w-full bg-slate-900/90 rounded-xl p-3 border border-yellow-400/30 grid grid-cols-2 gap-2 text-center text-xs">
                  <div><p className="text-slate-400 font-bold text-[9px]">PUNTOS</p><p className="font-black text-yellow-400 text-lg">{ranking[0].pts}</p></div>
                  <div><p className="text-slate-400 font-bold text-[9px]">TOPS</p><p className="font-black text-white text-lg">{ranking[0].tops}</p></div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 bg-[#0a0e17] border border-amber-800/40 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
                <div className="w-20 h-20 rounded-full bg-amber-950 border-2 border-amber-600 overflow-hidden flex items-center justify-center font-black text-2xl text-amber-500 mb-3 shadow-lg relative">
                  {ranking[2]?.coverUrl ? (
                    <img src={ranking[2].coverUrl} alt="3rd" className="w-full h-full object-cover" />
                  ) : (
                    <span>3</span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[10px] font-black text-amber-500 py-0.5">
                    #3
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">TERCER LUGAR</span>
                <h3 className="text-2xl font-black text-white mt-1">{ranking[2]?.name ?? "—"}</h3>
                <p className="text-xs font-bold text-slate-400 mb-4">{ranking[2]?.mainTcg ?? ""}</p>
                {ranking[2] && (
                  <div className="w-full bg-slate-900/80 rounded-xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                    <div><p className="text-slate-500 font-bold text-[9px]">PUNTOS</p><p className="font-black text-white text-base">{ranking[2].pts}</p></div>
                    <div><p className="text-slate-500 font-bold text-[9px]">TOPS</p><p className="font-black text-white text-base">{ranking[2].tops}</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="font-black text-white text-lg">Tabla General de Clasificación</h2>
              <span className="text-xs text-slate-500 font-bold">Actualizado en tiempo real</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">POS</th>
                    <th className="px-6 py-4">JUGADOR</th>
                    <th className="px-6 py-4">TCG PRINCIPAL</th>
                    <th className="px-6 py-4 text-center">TOPS</th>
                    <th className="px-6 py-4 text-right">PUNTOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {ranking.map((player) => (
                    <tr key={player.rank} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs ${
                          player.rank === 1 ? "bg-yellow-400 text-slate-950" :
                          player.rank === 2 ? "bg-slate-300 text-slate-950" :
                          player.rank === 3 ? "bg-amber-600 text-white" :
                          "bg-slate-800 text-slate-300"
                        }`}>
                          {player.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {player.coverUrl ? (
                              <img src={player.coverUrl} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-black text-yellow-400 uppercase">
                                {player.name.substring(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-white text-sm">{player.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-300">{player.mainTcg}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-300">{player.tops}</td>
                      <td className="px-6 py-4 text-right font-black text-yellow-400 text-base">{player.pts} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
