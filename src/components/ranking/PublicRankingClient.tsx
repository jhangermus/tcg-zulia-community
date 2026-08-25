"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Award, Flame, User, Gamepad2, Layers, ExternalLink } from "lucide-react";

export interface RankingDeckItem {
  id: string;
  playerName: string;
  placement: number;
  isRecommended?: boolean;
  coverImageUrl?: string | null;
  deckName?: string | null;
  tcg: {
    id: string;
    name: string;
    slug: string;
  };
  tournament?: {
    id: string;
    name: string;
    date: Date | string;
  } | null;
}

export interface RankingTcgItem {
  id: string;
  name: string;
  slug: string;
}

export function PublicRankingClient({
  decklists,
  tcgs,
}: {
  decklists: RankingDeckItem[];
  tcgs: RankingTcgItem[];
}) {
  const [selectedTcg, setSelectedTcg] = useState<string>("ALL");

  // Filter decklists for competitive ranking (exclude recommended guides)
  const competitiveDecks = decklists.filter((d) => !d.isRecommended && d.placement > 0);

  // Filter decks by selected TCG
  const filteredDecks = competitiveDecks.filter((d) => {
    if (selectedTcg === "ALL") return true;
    return d.tcg.slug.toLowerCase().includes(selectedTcg.toLowerCase()) || d.tcg.id === selectedTcg;
  });

  // Calculate points per player
  const playerStatsMap = new Map<
    string,
    {
      name: string;
      points: number;
      tournamentsCount: number;
      firstPlaceCount: number;
      secondPlaceCount: number;
      top4Count: number;
      top8Count: number;
      coverImageUrl?: string | null;
      primaryTcg: string;
      lastDeckName?: string | null;
    }
  >();

  for (const d of filteredDecks) {
    const rawName = d.playerName.trim();
    if (!rawName) continue;

    // Points system
    let points = 10;
    if (d.placement === 1) points = 100;
    else if (d.placement === 2) points = 75;
    else if (d.placement <= 4) points = 50;
    else if (d.placement <= 8) points = 25;

    const existing = playerStatsMap.get(rawName);
    if (existing) {
      existing.points += points;
      existing.tournamentsCount += 1;
      if (d.placement === 1) existing.firstPlaceCount += 1;
      else if (d.placement === 2) existing.secondPlaceCount += 1;
      else if (d.placement <= 4) existing.top4Count += 1;
      else if (d.placement <= 8) existing.top8Count += 1;
      if (!existing.coverImageUrl && d.coverImageUrl) {
        existing.coverImageUrl = d.coverImageUrl;
      }
      if (d.deckName) existing.lastDeckName = d.deckName;
    } else {
      playerStatsMap.set(rawName, {
        name: rawName,
        points: points,
        tournamentsCount: 1,
        firstPlaceCount: d.placement === 1 ? 1 : 0,
        secondPlaceCount: d.placement === 2 ? 1 : 0,
        top4Count: d.placement > 2 && d.placement <= 4 ? 1 : 0,
        top8Count: d.placement > 4 && d.placement <= 8 ? 1 : 0,
        coverImageUrl: d.coverImageUrl,
        primaryTcg: d.tcg.name,
        lastDeckName: d.deckName,
      });
    }
  }

  // Convert to array and sort descending by points
  const leaderboard = Array.from(playerStatsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.firstPlaceCount - a.firstPlaceCount;
  });

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restLeaderboard = leaderboard.slice(3);

  const getActiveTcgName = () => {
    if (selectedTcg === "ALL") return "TODOS LOS TCGs";
    const found = tcgs.find((t) => t.slug === selectedTcg || t.id === selectedTcg);
    return found ? found.name.toUpperCase() : "TCG SELECCIONADO";
  };

  return (
    <div className="space-y-8">
      {/* TCG Filter Tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-800 pb-4">
        <button
          onClick={() => setSelectedTcg("ALL")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black clip-chamfer-tr transition-all ${
            selectedTcg === "ALL"
              ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
              : "bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          TABLA GENERAL
        </button>

        {tcgs.map((tcg) => {
          const isActive = selectedTcg === tcg.slug || selectedTcg === tcg.id;
          return (
            <button
              key={tcg.id}
              onClick={() => setSelectedTcg(tcg.slug)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black clip-chamfer-tr transition-all ${
                isActive
                  ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                  : "bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <span>{tcg.name.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-[#070b14] border border-slate-800 p-16 text-center text-slate-400 space-y-3 clip-chamfer-tr">
          <Trophy className="w-16 h-16 mx-auto opacity-20 text-yellow-400" />
          <h3 className="text-lg font-black text-white">No hay registros de ranking para {getActiveTcgName()}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Los puntos se calculan automáticamente a medida que los administradores cargan los resultados y tops de cada torneo.
          </p>
        </div>
      ) : (
        <>
          {/* PODIUM TOP 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 2nd Place (Silver) */}
            {top2 && (
              <Link
                href={`/jugador/${encodeURIComponent(top2.name)}`}
                className="order-2 md:order-1 bg-[#0a0f1d] border border-slate-700 hover:border-slate-400 p-6 clip-chamfer-tr flex flex-col items-center text-center relative overflow-hidden group shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="absolute top-3 left-3 bg-slate-300/20 border border-slate-300/40 text-slate-200 text-xs font-black px-2.5 py-1 clip-tag-angled">
                  #02 PLATA
                </div>
                <div className="w-24 h-32 bg-slate-950 border-2 border-slate-400 rounded-sm overflow-hidden mb-4 relative shadow-md">
                  {top2.coverImageUrl ? (
                    <img src={top2.coverImageUrl} alt={top2.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <User className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-black text-xl text-white group-hover:text-yellow-400 transition-colors truncate w-full">
                  {top2.name}
                </h3>
                <span className="text-xs text-slate-400 font-bold mt-0.5">{top2.lastDeckName || top2.primaryTcg}</span>
                <div className="mt-4 bg-slate-900/90 border border-slate-700 px-5 py-2 clip-tag-angled">
                  <span className="text-2xl font-black text-white">{top2.points}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">PTS</span>
                </div>
                <span className="text-[10px] text-yellow-400 font-bold mt-3 group-hover:underline flex items-center gap-1">
                  VER PERFIL Y DECKS →
                </span>
              </Link>
            )}

            {/* 1st Place (Gold / Champion) */}
            {top1 && (
              <Link
                href={`/jugador/${encodeURIComponent(top1.name)}`}
                className="order-1 md:order-2 bg-gradient-to-b from-[#1c1404] via-[#0e0b04] to-[#070b14] border-2 border-yellow-400/80 hover:border-yellow-300 p-8 clip-chamfer-tr flex flex-col items-center text-center relative overflow-hidden group shadow-2xl hover:-translate-y-2 transition-all md:-mt-4"
              >
                <div className="absolute top-3 left-3 bg-yellow-400 text-slate-950 text-xs font-black px-3 py-1 clip-tag-angled shadow">
                  👑 #01 CAMPEÓN
                </div>
                <div className="w-28 h-36 bg-slate-950 border-2 border-yellow-400 rounded-sm overflow-hidden mb-4 relative shadow-lg">
                  {top1.coverImageUrl ? (
                    <img src={top1.coverImageUrl} alt={top1.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <Trophy className="w-12 h-12 text-yellow-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-black text-2xl text-white group-hover:text-yellow-400 transition-colors truncate w-full">
                  {top1.name}
                </h3>
                <span className="text-xs text-yellow-400/90 font-bold mt-0.5">{top1.lastDeckName || top1.primaryTcg}</span>
                <div className="mt-4 bg-yellow-400/20 border border-yellow-400/50 px-6 py-2.5 clip-tag-angled">
                  <span className="text-3xl font-black text-yellow-400">{top1.points}</span>
                  <span className="text-xs text-yellow-400 font-bold ml-1">PTS</span>
                </div>
                <span className="text-[11px] text-yellow-400 font-bold mt-3 group-hover:underline flex items-center gap-1">
                  VER PERFIL Y DECKS →
                </span>
              </Link>
            )}

            {/* 3rd Place (Bronze) */}
            {top3 && (
              <Link
                href={`/jugador/${encodeURIComponent(top3.name)}`}
                className="order-3 bg-[#0a0f1d] border border-amber-900/60 hover:border-amber-600 p-6 clip-chamfer-tr flex flex-col items-center text-center relative overflow-hidden group shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="absolute top-3 left-3 bg-amber-600/20 border border-amber-600/40 text-amber-300 text-xs font-black px-2.5 py-1 clip-tag-angled">
                  #03 BRONCE
                </div>
                <div className="w-24 h-32 bg-slate-950 border-2 border-amber-700 rounded-sm overflow-hidden mb-4 relative shadow-md">
                  {top3.coverImageUrl ? (
                    <img src={top3.coverImageUrl} alt={top3.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <Medal className="w-10 h-10 text-amber-500" />
                    </div>
                  )}
                </div>
                <h3 className="font-black text-xl text-white group-hover:text-yellow-400 transition-colors truncate w-full">
                  {top3.name}
                </h3>
                <span className="text-xs text-slate-400 font-bold mt-0.5">{top3.lastDeckName || top3.primaryTcg}</span>
                <div className="mt-4 bg-slate-900/90 border border-slate-700 px-5 py-2 clip-tag-angled">
                  <span className="text-2xl font-black text-white">{top3.points}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">PTS</span>
                </div>
                <span className="text-[10px] text-yellow-400 font-bold mt-3 group-hover:underline flex items-center gap-1">
                  VER PERFIL Y DECKS →
                </span>
              </Link>
            )}
          </div>

          {/* FULL LEADERBOARD TABLE */}
          <div className="bg-[#070b14] border border-slate-800 clip-chamfer-tr overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="font-black text-white text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" /> Tabla de Clasificación ({getActiveTcgName()})
                </h2>
                <p className="text-xs text-slate-400 font-semibold">Haz clic en cualquier jugador para consultar su historial de torneos y mazos.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {leaderboard.map((p, idx) => {
                const pos = idx + 1;
                const posClass =
                  pos === 1
                    ? "text-yellow-400 font-black text-lg"
                    : pos === 2
                    ? "text-slate-200 font-black text-lg"
                    : pos === 3
                    ? "text-amber-500 font-black text-lg"
                    : "text-slate-400 font-bold text-sm";

                return (
                  <Link
                    key={p.name}
                    href={`/jugador/${encodeURIComponent(p.name)}`}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-800/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`w-8 text-center shrink-0 ${posClass}`}>
                        #{pos.toString().padStart(2, "0")}
                      </span>

                      <div className="w-10 h-14 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                        {p.coverImageUrl ? (
                          <img src={p.coverImageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <User className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-black text-white text-base group-hover:text-yellow-400 transition-colors truncate">
                          {p.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-bold text-slate-300">{p.primaryTcg}</span>
                          <span>•</span>
                          <span>{p.tournamentsCount} Torneo(s)</span>
                          {p.firstPlaceCount > 0 && (
                            <span className="text-yellow-400 font-bold">🥇 {p.firstPlaceCount} Win(s)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-black text-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all">
                          {p.points}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold ml-1">PTS</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition-colors hidden sm:block" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
