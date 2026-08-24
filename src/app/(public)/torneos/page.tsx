import { prisma } from "@/lib/prisma";
import { Trophy, Calendar, MapPin, Users, Award, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TorneosPage() {
  const [tournaments, tcgs] = await Promise.all([
    prisma.tournament.findMany({
      orderBy: { date: "desc" },
      include: {
        tcg: true,
        decklists: {
          orderBy: { placement: "asc" },
        },
      },
    }),
    prisma.tcg.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);

  const upcomingTournaments = tournaments.filter(
    (t) => t.status === "UPCOMING" || (t.status === "ONGOING" && new Date(t.date) >= new Date())
  );
  const pastTournaments = tournaments.filter(
    (t) => t.status === "COMPLETED" || new Date(t.date) < new Date()
  );

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
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all tracking-widest shadow-lg shadow-yellow-400/20"
          >
            UNIRSE A LA COMUNIDAD
          </Link>
        </div>
      </div>

      {/* PRÓXIMOS EVENTOS */}
      <section className="space-y-4">
        <h2 className="text-xl font-black italic text-white flex items-center gap-2 tracking-wide">
          <Calendar className="w-5 h-5 text-yellow-400" /> PRÓXIMOS EVENTOS
        </h2>

        {upcomingTournaments.length === 0 ? (
          <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
            <Calendar className="w-12 h-12 mx-auto opacity-30 text-yellow-400" />
            <h3 className="text-base font-black text-white">No hay torneos próximos programados</h3>
            <p className="text-xs text-slate-400">Pronto se anunciarán las próximas fechas y sedes de torneos oficiales.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingTournaments.map((t) => (
              <div
                key={t.id}
                className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-yellow-400/50 transition-all group relative overflow-hidden shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-800 text-yellow-400 border border-yellow-400/20">
                      {t.tcg.name}
                    </span>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                      {t.status === "ONGOING" ? "EN CURSO" : "PRÓXIMO"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black italic text-white group-hover:text-yellow-400 transition-colors mb-4">
                    {t.name}
                  </h3>

                  <div className="space-y-2.5 text-xs font-semibold text-slate-300 mb-6">
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
                  className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-3 rounded-xl text-xs transition-colors tracking-widest shadow-lg shadow-yellow-400/20"
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
          <Trophy className="w-5 h-5 text-yellow-400" /> HISTORIAL Y RESULTADOS DE TORNEOS
        </h2>

        {pastTournaments.length === 0 ? (
          <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
            <Trophy className="w-12 h-12 mx-auto opacity-30 text-yellow-400" />
            <h3 className="text-base font-black text-white">No hay torneos en el historial todavía</h3>
            <p className="text-xs text-slate-400">Los resultados de torneos finalizados se mostrarán aquí con sus mazos ganadores.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastTournaments.map((t) => {
              const champion = t.decklists.find((d) => d.placement === 1);
              const topList = t.decklists.slice(0, 4);

              return (
                <div key={t.id} className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-xl">
                  {/* Champion Box */}
                  <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-yellow-400/10 via-slate-900 to-slate-950 rounded-xl flex flex-col items-center justify-center text-center p-3 border border-yellow-400/30 flex-shrink-0">
                    <Trophy className="w-8 h-8 text-yellow-400 mb-1.5" />
                    <span className="text-[9px] text-yellow-400/90 font-black uppercase tracking-wider">CAMPEÓN</span>
                    <span className="text-sm font-black text-white truncate max-w-full">
                      {champion?.playerName || "—"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold truncate max-w-full mt-0.5">
                      {champion?.deckName || "Por definir"}
                    </span>
                  </div>

                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded bg-slate-800 text-yellow-400 border border-slate-700">
                          {t.tcg.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(t.date).toLocaleDateString("es-VE", { dateStyle: "medium" })}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white mb-3">{t.name}</h3>

                      {/* Tops Placements */}
                      {topList.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
                          {topList.map((d, i) => (
                            <div key={d.id} className="flex items-center gap-2">
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                                  d.placement === 1
                                    ? "bg-yellow-400 text-slate-950"
                                    : d.placement === 2
                                    ? "bg-slate-300 text-slate-950"
                                    : "bg-amber-600 text-white"
                                }`}
                              >
                                {d.placement}
                              </span>
                              <span className="truncate">{d.playerName}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Decklists de los tops en proceso de carga.</p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/80">
                      <Link
                        href="/decks"
                        className="flex-1 text-center bg-yellow-400/10 hover:bg-yellow-400 border border-yellow-400/30 hover:border-yellow-400 text-yellow-400 hover:text-slate-950 font-black text-xs py-2 rounded-xl transition-all tracking-wider"
                      >
                        VER TOP DECKS
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
