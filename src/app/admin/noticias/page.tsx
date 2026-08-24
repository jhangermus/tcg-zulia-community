import { prisma } from "@/lib/prisma";
import { Newspaper, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { createNews } from "@/lib/actions";

export const dynamic = "force-dynamic";

const TAG_OPTIONS = ["RESULTADOS", "DECK PROFILE", "COMUNIDAD", "ANUNCIO", "NOTICIAS"];
const TAG_COLORS: Record<string, string> = {
  RESULTADOS: "bg-purple-600",
  "DECK PROFILE": "bg-blue-600",
  COMUNIDAD: "bg-green-600",
  ANUNCIO: "bg-orange-500",
  NOTICIAS: "bg-slate-600",
};

export default async function NoticiasPage() {
  const news = await prisma.news.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Newspaper className="text-green-400 w-8 h-8" /> Noticias
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Gestiona las publicaciones del feed principal.</p>
      </div>

      {/* Add Form */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
        <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-400" /> Nueva Noticia
        </h2>
        <form action={createNews} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">TÍTULO *</label>
              <input name="title" required placeholder="Ej: Copa Zulia #09 - Resultados" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">TAG / CATEGORÍA</label>
              <select name="tag" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-400 transition-all">
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">URL DE IMAGEN (opcional)</label>
              <input name="imageUrl" placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-400 transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">CONTENIDO *</label>
              <textarea name="content" required rows={3} placeholder="Descripción de la noticia..." className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-400 transition-all resize-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-green-500 hover:bg-green-400 text-white font-black px-8 py-2.5 rounded-lg text-sm transition-colors tracking-wider">
              PUBLICAR NOTICIA
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-black text-white text-lg">Publicaciones ({news.length})</h2>
        </div>
        {news.length === 0 ? (
          <div className="p-12 text-center">
            <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No hay noticias publicadas.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {news.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${TAG_COLORS[item.tag] || "bg-slate-600"}`}>
                      {item.tag}
                    </span>
                    {!item.published && <span className="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">OCULTA</span>}
                  </div>
                  <p className="font-black text-white text-sm">{item.title}</p>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-1">{item.content}</p>
                  <p className="text-slate-600 text-[10px] mt-1">{new Date(item.createdAt).toLocaleDateString("es-VE")}</p>
                </div>

                {/* Toggle Published */}
                <form action={async () => {
                  "use server";
                  const { toggleNewsPublished } = await import("@/lib/actions");
                  await toggleNewsPublished(item.id, !item.published);
                }}>
                  <button type="submit" title={item.published ? "Ocultar" : "Publicar"} className={`p-2 rounded-lg transition-colors ${item.published ? "text-green-400 hover:bg-green-400/10" : "text-slate-500 hover:bg-slate-700"}`}>
                    {item.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </form>

                {/* Delete */}
                <form action={async () => {
                  "use server";
                  const { deleteNews } = await import("@/lib/actions");
                  await deleteNews(item.id);
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

