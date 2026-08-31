"use client";

import Link from "next/link";
import { useState } from "react";

type PlayerRanking = {
  name: string;
  pts: number;
  coverUrl?: string | null;
};

type RankingTabsProps = {
  rankings: Record<string, PlayerRanking[]>;
  tcgNames: Record<string, string>;
};

export default function RankingTabs({ rankings, tcgNames }: RankingTabsProps) {
  const tcgKeys = Object.keys(rankings);
  const [activeTab, setActiveTab] = useState(tcgKeys[0] || "");

  if (tcgKeys.length === 0) {
    return <p className="text-slate-300 text-sm text-center py-6 font-semibold">Sin datos de ranking aún</p>;
  }

  const activeRankings = rankings[activeTab] || [];
  const colors = ["text-yellow-400", "text-slate-200", "text-amber-400", "text-slate-300", "text-slate-400"];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {tcgKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`text-[10px] font-black px-3 py-1.5 uppercase transition-colors whitespace-nowrap clip-btn-tactical ${
              activeTab === key
                ? "bg-yellow-400 text-slate-950"
                : "bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            {tcgNames[key] || key}
          </button>
        ))}
      </div>

      {/* Ranking List */}
      <div className="space-y-3.5 min-h-[220px]">
        {activeRankings.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-4">No hay jugadores</p>
        ) : (
          activeRankings.map((p, i) => (
            <Link
              key={p.name}
              href={`/jugador/${encodeURIComponent(p.name)}`}
              className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2 hover:bg-slate-800/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`font-black text-sm w-6 ${colors[i] || "text-slate-500"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-9 h-9 rounded-sm bg-[#0c1220] border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow">
                  {p.coverUrl ? (
                    <img
                      src={p.coverUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
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
          ))
        )}
      </div>
    </div>
  );
}
