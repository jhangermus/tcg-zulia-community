import { prisma } from "@/lib/prisma";
import { Newspaper, Calendar, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TAG_COLORS: Record<string, string> = {
  RESULTADOS: "bg-purple-600 text-white",
  "DECK PROFILE": "bg-blue-600 text-white",
  COMUNIDAD: "bg-green-600 text-white",
  ANUNCIO: "bg-orange-500 text-white",
  NOTICIAS: "bg-slate-600 text-white",
};

export default async function NoticiasPage() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            NOTICIAS Y <span className="text-yellow-400">ACTUALIDAD</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Entérate de los resultados de torneos, anuncios oficiales y novedades del metagame en el Zulia.
          </p>
        </div>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-12 text-center">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">No hay noticias publicadas en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-600 transition-all group"
            >
              <div>
                {/* Image or Banner Placeholder */}
                <div className="h-44 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden border-b border-slate-800">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900/60">
                      <Newspaper className="w-12 h-12 text-slate-700" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[9px] font-black uppercase px-2.5 py-1 rounded shadow-md ${TAG_COLORS[item.tag] || "bg-slate-700 text-white"}`}>
                    {item.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors mb-3">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-yellow-400">
                  <span>LEER ARTÍCULO COMPLETO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
