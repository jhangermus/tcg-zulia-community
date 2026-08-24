import { prisma } from "@/lib/prisma";
import { Trophy, Calendar, MapPin, Users, Award, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TorneosPage() {
  const [tournaments, tcgs] = await Promise.all([
    prisma.tournament.findMany({
      orderBy: { date: "desc" },
      include: { tcg: true },
    }),
    prisma.tcg.findMany({ where: { status: "ACTIVE" } }),
  ]);

  const upcomingTournaments = tournaments.filter((t) => t.status === "UPCOMING" || new Date(t.date) >= new Date());
  const pastTournaments = tournaments.filter((t) => t.status === "COMPLETED" || new Date(t.date) < new Date());

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            TORNEOS Y <span className="text-yellow-400">CALENDARIO</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Compite en los eventos oficiales de la comunidad del Zulia para Yu-Gi-Oh!, One Piece y Digimon.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/comunidad"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors tracking-widest"
          >
            INSCRIBIRSE / INFO
          </Link>
        </div>
      </div>

      {/* TCG Filters */}
      <div className="flex flex-wrap gap-2">
        <button className="bg-yellow-400 text-slate-950 font-black text-xs px-4 py-2 rounded-lg transition-colors">
          TODOS LOS JUEGOS
        </button>
        {tcgs.map((tcg) => (
          <button
            key={tcg.id}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            {tcg.name}
          </button>
        ))}
      </div>

      {/* PRÓXIMOS EVENTOS */}
      <section className="space-y-4">
        <h2 className="text-xl font-black italic text-white flex items-center gap-2 tracking-wide">
          <Calendar className="w-5 h-5 text-yellow-400" /> PRÓXIMOS EVENTOS
        </h2>

        {upcomingTournaments.length === 0 ? (
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-8 text-center text-slate-400 font-medium">
            No hay torneos próximos programados en este momento. ¡Atento a las noticias!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingTournaments.map((t) => (
              <div
                key={t.id}
                className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-yellow-400/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-bl-full pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-slate-800 text-yellow-400 border border-yellow-400/20">
                      {t.tcg.name}
                    </span>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      PRÓXIMO
                    </span>
                  </div>

                  <h3 className="text-2xl font-black italic text-white group-hover:text-yellow-400 transition-colors mb-4">
                    {t.name}
                  </h3>

                  <div className="space-y-2 text-xs font-semibold text-slate-300 mb-6">
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>{new Date(t.date).toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>{new Date(t.date).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>{t.location || "Maracaibo, Zulia"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>Cupo: {t.participantsCount > 0 ? `${t.participantsCount} jugadores` : "Abierto"}</span>
                    </div>
                    {t.prize && (
                      <div className="flex items-center gap-2.5 text-yellow-400 font-bold">
                        <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span>Premio: {t.prize}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href="/comunidad"
                  className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-2.5 rounded-lg text-xs transition-colors tracking-widest"
                >
                  REGISTRARSE AL TORNEO
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TORNEOS RECIENTES / HISTORIAL */}
      <section className="space-y-4 pt-6 border-t border-slate-800">
        <h2 className="text-xl font-black italic text-white flex items-center gap-2 tracking-wide">
          <Trophy className="w-5 h-5 text-blue-400" /> HISTORIAL Y RESULTADOS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Historial 1 */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-36 h-36 bg-gradient-to-br from-red-900/40 to-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-3 border border-red-900/40 flex-shrink-0">
              <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
              <span className="text-[10px] text-slate-400 font-bold">CAMPEÓN</span>
              <span className="text-sm font-black text-white">JHANGER U.</span>
              <span className="text-[9px] text-red-400 font-bold">Snake-Eye</span>
            </div>

            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                    YU-GI-OH!
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">26 MAYO 2024</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3">COPA ZULIA #08</h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-500 text-black flex items-center justify-center text-[8px] font-black">1</span>
                    <span>Jhanger U.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-400 text-black flex items-center justify-center text-[8px] font-black">2</span>
                    <span>Luisdavid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-orange-700 text-white flex items-center justify-center text-[8px] font-black">3</span>
                    <span>Rafael A.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[8px] font-black">4</span>
                    <span>Angel D.</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  href="/decks"
                  className="flex-1 text-center bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 hover:border-blue-500 text-blue-300 hover:text-white font-bold text-xs py-2 rounded-lg transition-colors"
                >
                  VER TOP DECKS
                </Link>
              </div>
            </div>
          </div>

          {/* Card Historial 2 */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-36 h-36 bg-gradient-to-br from-purple-900/40 to-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-3 border border-purple-900/40 flex-shrink-0">
              <Trophy className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-[10px] text-slate-400 font-bold">CAMPEÓN</span>
              <span className="text-sm font-black text-white">CARLOS M.</span>
              <span className="text-[9px] text-purple-400 font-bold">R/B Luffy</span>
            </div>

            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/40">
                    ONE PIECE
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">19 MAYO 2024</span>
                </div>
                <h3 className="text-xl font-black text-white mb-3">PIRATE CUP MARACAIBO</h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-500 text-black flex items-center justify-center text-[8px] font-black">1</span>
                    <span>Carlos M.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-400 text-black flex items-center justify-center text-[8px] font-black">2</span>
                    <span>Jhanger U.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-orange-700 text-white flex items-center justify-center text-[8px] font-black">3</span>
                    <span>Alejandro V.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[8px] font-black">4</span>
                    <span>Gabriel R.</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  href="/decks"
                  className="flex-1 text-center bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 hover:border-purple-500 text-purple-300 hover:text-white font-bold text-xs py-2 rounded-lg transition-colors"
                >
                  VER TOP DECKS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
