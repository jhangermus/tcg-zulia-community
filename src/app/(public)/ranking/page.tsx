import { Crown, Trophy, Medal, Flame, Star, Shield } from "lucide-react";
import Link from "next/link";

const RANKING_DATA = [
  { rank: 1, name: "Jhanger U.", points: 842, winRate: "78%", topsCount: 8, mainTcg: "Yu-Gi-Oh!", title: "Campeón Regional", color: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" },
  { rank: 2, name: "Luisdavid", points: 731, winRate: "72%", topsCount: 6, mainTcg: "Yu-Gi-Oh!", title: "Finalista Copa Zulia", color: "text-slate-300 border-slate-400/40 bg-slate-400/10" },
  { rank: 3, name: "Rafael A.", points: 698, winRate: "69%", topsCount: 5, mainTcg: "Digimon", title: "Maestro Tamer", color: "text-amber-600 border-amber-600/40 bg-amber-600/10" },
  { rank: 4, name: "Carlos M.", points: 665, winRate: "74%", topsCount: 5, mainTcg: "One Piece", title: "Rey de los Piratas", color: "text-slate-400 border-slate-700 bg-slate-900" },
  { rank: 5, name: "Angel D.", points: 641, winRate: "65%", topsCount: 4, mainTcg: "Yu-Gi-Oh!", title: "Top Duelista", color: "text-slate-400 border-slate-700 bg-slate-900" },
  { rank: 6, name: "Gustavo S.", points: 592, winRate: "61%", topsCount: 4, mainTcg: "One Piece", title: "Capitán Zulia", color: "text-slate-400 border-slate-700 bg-slate-900" },
  { rank: 7, name: "Alejandro V.", points: 540, winRate: "59%", topsCount: 3, mainTcg: "Digimon", title: "Duelista Élite", color: "text-slate-400 border-slate-700 bg-slate-900" },
  { rank: 8, name: "Gabriel R.", points: 512, winRate: "58%", topsCount: 3, mainTcg: "Yu-Gi-Oh!", title: "Challenger", color: "text-slate-400 border-slate-700 bg-slate-900" },
];

export default function RankingPage() {
  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            RANKING DE <span className="text-yellow-400">JUGADORES</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Tabla de clasificación general de la comunidad de TCG en el Estado Zulia (Temporada 2024-2026).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-bold text-slate-300">
          <Flame className="w-4 h-4 text-orange-500" /> TEMPORADA ACTIVA
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* 2nd Place */}
        <div className="order-2 md:order-1 bg-[#0a0e17] border border-slate-700/60 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-black text-2xl text-slate-300 mb-3 shadow-lg">
            2
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SUB-CAMPEÓN</span>
          <h3 className="text-2xl font-black text-white mt-1">{RANKING_DATA[1].name}</h3>
          <p className="text-xs font-bold text-slate-400 mb-4">{RANKING_DATA[1].title}</p>
          <div className="w-full bg-slate-900/80 rounded-lg p-3 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div><p className="text-slate-500 font-bold text-[9px]">PUNTOS</p><p className="font-black text-white text-sm">{RANKING_DATA[1].points}</p></div>
            <div><p className="text-slate-500 font-bold text-[9px]">WINRATE</p><p className="font-black text-green-400 text-sm">{RANKING_DATA[1].winRate}</p></div>
            <div><p className="text-slate-500 font-bold text-[9px]">TOPS</p><p className="font-black text-white text-sm">{RANKING_DATA[1].topsCount}</p></div>
          </div>
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2 bg-gradient-to-b from-yellow-400/15 via-[#0a0e17] to-[#0a0e17] border-2 border-yellow-400/60 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-2xl scale-105">
          <div className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-[#0a0e17] flex items-center justify-center font-black text-3xl text-slate-950 mb-3 shadow-yellow-400/30 shadow-lg">
            <Crown className="w-10 h-10 text-slate-950" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-0.5 rounded-full">
            NÚMERO 1 DEL ZULIA
          </span>
          <h3 className="text-3xl font-black text-white mt-2">{RANKING_DATA[0].name}</h3>
          <p className="text-xs font-bold text-yellow-400 mb-4">{RANKING_DATA[0].title}</p>
          <div className="w-full bg-slate-900/90 rounded-lg p-3 border border-yellow-400/30 grid grid-cols-3 gap-2 text-center text-xs">
            <div><p className="text-slate-400 font-bold text-[9px]">PUNTOS</p><p className="font-black text-yellow-400 text-base">{RANKING_DATA[0].points}</p></div>
            <div><p className="text-slate-400 font-bold text-[9px]">WINRATE</p><p className="font-black text-green-400 text-base">{RANKING_DATA[0].winRate}</p></div>
            <div><p className="text-slate-400 font-bold text-[9px]">TOPS</p><p className="font-black text-white text-base">{RANKING_DATA[0].topsCount}</p></div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 bg-[#0a0e17] border border-amber-800/40 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-600 flex items-center justify-center font-black text-2xl text-amber-500 mb-3 shadow-lg">
            3
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">TERCER LUGAR</span>
          <h3 className="text-2xl font-black text-white mt-1">{RANKING_DATA[2].name}</h3>
          <p className="text-xs font-bold text-slate-400 mb-4">{RANKING_DATA[2].title}</p>
          <div className="w-full bg-slate-900/80 rounded-lg p-3 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div><p className="text-slate-500 font-bold text-[9px]">PUNTOS</p><p className="font-black text-white text-sm">{RANKING_DATA[2].points}</p></div>
            <div><p className="text-slate-500 font-bold text-[9px]">WINRATE</p><p className="font-black text-green-400 text-sm">{RANKING_DATA[2].winRate}</p></div>
            <div><p className="text-slate-500 font-bold text-[9px]">TOPS</p><p className="font-black text-white text-sm">{RANKING_DATA[2].topsCount}</p></div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-black text-white text-lg">Tabla General de Clasificación</h2>
          <span className="text-xs text-slate-500 font-bold">Actualizado semanalmente</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">POS</th>
                <th className="px-6 py-4">JUGADOR</th>
                <th className="px-6 py-4">TCG PRINCIPAL</th>
                <th className="px-6 py-4 text-center">TOPS</th>
                <th className="px-6 py-4 text-center">WIN RATE</th>
                <th className="px-6 py-4 text-right">PUNTOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {RANKING_DATA.map((player) => (
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
                    <p className="font-black text-white text-sm">{player.name}</p>
                    <p className="text-[11px] text-slate-500">{player.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-300">{player.mainTcg}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-300">{player.topsCount}</td>
                  <td className="px-6 py-4 text-center font-bold text-green-400">{player.winRate}</td>
                  <td className="px-6 py-4 text-right font-black text-yellow-400 text-base">{player.points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
