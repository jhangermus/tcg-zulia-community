import { prisma } from "@/lib/prisma";
import { Trophy, Plus, Trash2 } from "lucide-react";
import { createTournament } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Próximo", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  ONGOING: { label: "En Curso", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  COMPLETED: { label: "Completado", color: "text-green-400 bg-green-400/10 border-green-400/30" },
};

export default async function TorneosPage() {
  const [tournaments, tcgs] = await Promise.all([
    prisma.tournament.findMany({ orderBy: { date: "desc" }, include: { tcg: true } }),
    prisma.tcg.findMany({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Trophy className="text-blue-400 w-8 h-8" /> Torneos
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Programa y gestiona los torneos de la comunidad.</p>
      </div>

      {/* Add Form */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
        <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" /> Nuevo Torneo
        </h2>
        <form action={createTournament} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">NOMBRE *</label>
              <input name="name" required placeholder="Ej: Copa Zulia #09" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">JUEGO (TCG) *</label>
              {tcgs.length === 0 ? (
                <p className="text-xs text-red-400 font-bold pt-3">Agrega un TCG activo primero.</p>
              ) : (
                <select name="tcgId" required className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-all">
                  {tcgs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">FECHA *</label>
              <input name="date" type="datetime-local" required className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">UBICACIÓN</label>
              <input name="location" placeholder="Ej: Maracaibo, Zulia" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">PREMIO</label>
              <input name="prize" placeholder="Ej: $50 en productos" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">N° DE JUGADORES</label>
              <input name="participantsCount" type="number" defaultValue={0} className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">ESTADO</label>
              <select name="status" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-all">
                <option value="UPCOMING">Próximo</option>
                <option value="ONGOING">En Curso</option>
                <option value="COMPLETED">Completado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-400 text-white font-black px-8 py-2.5 rounded-lg text-sm transition-colors tracking-wider">
              CREAR TORNEO
            </button>
          </div>
        </form>
      </div>

      {/* Tournaments List */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-black text-white text-lg">Torneos Registrados ({tournaments.length})</h2>
        </div>
        {tournaments.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No hay torneos registrados.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {tournaments.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-700 text-slate-300">{t.tcg.name}</span>
                  </div>
                  <p className="font-black text-white text-sm">{t.name}</p>
                  <div className="flex gap-3 text-[10px] text-slate-500 font-medium mt-0.5">
                    <span>{new Date(t.date).toLocaleDateString("es-VE", { dateStyle: "long" })}</span>
                    {t.location && <span>• {t.location}</span>}
                    {t.participantsCount > 0 && <span>• {t.participantsCount} jugadores</span>}
                    {t.prize && <span>• {t.prize}</span>}
                  </div>
                </div>

                <span className={`text-[10px] font-black px-3 py-1 rounded-full border flex-shrink-0 ${STATUS_MAP[t.status]?.color}`}>
                  {STATUS_MAP[t.status]?.label}
                </span>

                <form action={async () => {
                  "use server";
                  const { deleteTournament } = await import("@/lib/actions");
                  await deleteTournament(t.id);
                }}>
                  <button type="submit" className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

