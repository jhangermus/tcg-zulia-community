import { prisma } from "@/lib/prisma";
import { Gamepad2, Plus, Trash2 } from "lucide-react";
import { createTcg, deleteTcg, updateTcgStatus } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Activo", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  SUSPENDED: { label: "Suspendido", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  NOT_PLAYED: { label: "No jugado", color: "text-slate-400 bg-slate-700/30 border-slate-600" },
};

export default async function TcgsPage() {
  const tcgs = await prisma.tcg.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Gamepad2 className="text-yellow-400 w-8 h-8" /> Juegos (TCGs)
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Administra los juegos de cartas disponibles en el sitio.</p>
        </div>
      </div>

      {/* Add New TCG Form */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
        <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-yellow-400" /> Agregar Nuevo Juego
        </h2>
        <form action={createTcg} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">NOMBRE *</label>
            <input name="name" required placeholder="Yu-Gi-Oh!" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">SLUG *</label>
            <input name="slug" required placeholder="yugioh" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">COLOR ACENTO</label>
            <input name="color" placeholder="#EF4444" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">ESTADO</label>
            <select name="status" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all">
              <option value="ACTIVE">Activo</option>
              <option value="SUSPENDED">Suspendido</option>
              <option value="NOT_PLAYED">No jugado</option>
            </select>
          </div>
          <div className="xl:col-span-4 flex justify-end">
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-2.5 rounded-lg text-sm transition-colors tracking-wider">
              AGREGAR JUEGO
            </button>
          </div>
        </form>
      </div>

      {/* TCG List */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-black text-white text-lg">Juegos Registrados ({tcgs.length})</h2>
        </div>
        {tcgs.length === 0 ? (
          <div className="p-12 text-center">
            <Gamepad2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No hay juegos registrados todavía.</p>
            <p className="text-slate-600 text-sm mt-1">Agrega el primero usando el formulario de arriba.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {tcgs.map((tcg) => (
              <div key={tcg.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                {/* Color dot */}
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-950 font-black text-sm"
                  style={{ backgroundColor: tcg.color || "#94a3b8" }}
                >
                  {tcg.name.charAt(0)}
                </div>

                <div className="flex-grow min-w-0">
                  <p className="font-black text-white text-sm">{tcg.name}</p>
                  <p className="text-slate-500 text-xs font-medium">/{tcg.slug}</p>
                </div>

                {/* Status Selector */}
                <form action={async (formData: FormData) => {
                  "use server";
                  await updateTcgStatus(tcg.id, formData.get("status") as string);
                }} className="flex items-center gap-2">
                  <select
                    name="status"
                    defaultValue={tcg.status}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border bg-slate-900 focus:outline-none ${STATUS_LABELS[tcg.status]?.color || "text-slate-400 border-slate-700"}`}
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                    <option value="NOT_PLAYED">No jugado</option>
                  </select>
                  <button type="submit" className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded transition-colors">
                    Guardar
                  </button>
                </form>

                {/* Delete */}
                <form action={async () => {
                  "use server";
                  await deleteTcg(tcg.id);
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
