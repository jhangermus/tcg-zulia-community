import { prisma } from "@/lib/prisma";
import { Trophy, Plus, Trash2, PenTool, ExternalLink, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { createTournament, deleteTournament } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Próximo", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  ONGOING: { label: "En Curso", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  COMPLETED: { label: "Completado", color: "text-green-400 bg-green-400/10 border-green-400/30" },
};

export default async function TorneosPage() {
  const [tournaments, tcgs] = await Promise.all([
    prisma.tournament.findMany({
      orderBy: { date: "desc" },
      include: { tcg: true, decklists: { select: { id: true, placement: true, playerName: true } } },
    }),
    prisma.tcg.findMany({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Trophy className="text-yellow-400 w-8 h-8" /> Gestión de Torneos y Tops
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Crea y administra los torneos de la comunidad. Para cada torneo puedes cargar las decklists de los ganadores (1er Lugar, Finalista, Top 4 y Top 8).
        </p>
      </div>

      {/* Add Form */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-yellow-400" /> Crear Nuevo Torneo
        </h2>
        <form action={createTournament} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">NOMBRE DEL TORNEO *</label>
              <input
                name="name"
                required
                placeholder="Ej: Copa Zulia #09 - Yu-Gi-Oh!"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">JUEGO (TCG) *</label>
              {tcgs.length === 0 ? (
                <p className="text-xs text-red-400 font-bold pt-3">Agrega un TCG activo primero.</p>
              ) : (
                <select
                  name="tcgId"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all font-bold"
                >
                  {tcgs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">FECHA Y HORA *</label>
              <input
                name="date"
                type="datetime-local"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">UBICACIÓN / SEDE</label>
              <input
                name="location"
                placeholder="Ej: CC Galerías Mall, Maracaibo"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">PREMIO A REPARTIR</label>
              <input
                name="prize"
                placeholder="Ej: $100 + Playmat Exclusivo"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">N° DE JUGADORES / CUPOS</label>
              <input
                name="participantsCount"
                type="number"
                defaultValue={16}
                min={0}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">ESTADO DEL TORNEO</label>
              <select
                name="status"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all font-bold"
              >
                <option value="UPCOMING">Próximo (Por realizar)</option>
                <option value="ONGOING">En Curso (En juego)</option>
                <option value="COMPLETED">Completado (Finalizado)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-3 rounded-lg text-xs transition-colors tracking-widest shadow-lg shadow-yellow-400/20"
            >
              CREAR TORNEO
            </button>
          </div>
        </form>
      </div>

      {/* Tournaments List */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Torneos Registrados ({tournaments.length})
          </h2>
        </div>
        {tournaments.length === 0 ? (
          <div className="p-16 text-center text-slate-500 font-bold text-sm">
            <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            No hay torneos registrados. Agrega el primero con el formulario de arriba.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {tournaments.map((t) => {
              const topsCount = t.decklists.length;
              return (
                <div key={t.id} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-grow min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-slate-800 text-yellow-400 border border-slate-700 uppercase">
                        {t.tcg.name}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${STATUS_MAP[t.status]?.color}`}>
                        {STATUS_MAP[t.status]?.label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        🏆 {topsCount} {topsCount === 1 ? "Top cargado" : "Tops cargados"}
                      </span>
                    </div>

                    <h3 className="font-black text-white text-base md:text-lg">{t.name}</h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(t.date).toLocaleDateString("es-VE", { dateStyle: "medium" })}
                      </span>
                      {t.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {t.location}
                        </span>
                      )}
                      {t.participantsCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" /> {t.participantsCount} jugadores
                        </span>
                      )}
                      {t.prize && <span>• Premio: <strong className="text-yellow-400">{t.prize}</strong></span>}
                    </div>
                  </div>

                  {/* Actions: Direct Top Decklist Builder Button + Delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/admin/decks?tournamentId=${t.id}&tcgId=${t.tcgId}`}
                      className="flex items-center gap-2 bg-yellow-400/10 hover:bg-yellow-400 text-yellow-400 hover:text-slate-950 border border-yellow-400/30 px-4 py-2.5 rounded-xl text-xs font-black transition-all tracking-wider"
                    >
                      <PenTool className="w-4 h-4" /> CARGAR TOPS (DECKLISTS)
                    </Link>

                    <form
                      action={async () => {
                        "use server";
                        await deleteTournament(t.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-slate-600 hover:text-red-400 transition-colors p-2.5 rounded-lg hover:bg-red-400/10"
                        title="Eliminar Torneo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
