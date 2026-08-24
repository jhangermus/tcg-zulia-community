"use client";

import { useState } from "react";
import { Newspaper, Calendar, Globe, ExternalLink, Tag, X, Flame } from "lucide-react";

export interface PublicNewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  tag: string;
  tcgSlug?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  publishedAt: Date | string;
}

export function PublicNewsClient({ news }: { news: PublicNewsItem[] }) {
  const [selectedTcg, setSelectedTcg] = useState<string>("ALL");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [activeModalItem, setActiveModalItem] = useState<PublicNewsItem | null>(null);

  const filteredNews = news.filter((item) => {
    const matchTcg =
      selectedTcg === "ALL" ||
      (item.tcgSlug && item.tcgSlug.toLowerCase() === selectedTcg.toLowerCase());

    const matchTag =
      selectedTag === "ALL" ||
      item.tag.toLowerCase() === selectedTag.toLowerCase();

    return matchTcg && matchTag;
  });

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("es-VE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      <div className="space-y-4">
        {/* TCG Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "ALL", label: "TODOS LOS JUEGOS" },
            { id: "yugioh", label: "YU-GI-OH!" },
            { id: "one-piece", label: "ONE PIECE" },
            { id: "digimon", label: "DIGIMON" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTcg(tab.id)}
              className={`text-xs font-black px-4 py-2 transition-all clip-chamfer-tr ${
                selectedTcg === tab.id
                  ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                  : "bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
          {[
            { id: "ALL", label: "TODAS LAS CATEGORÍAS" },
            { id: "LEAKS & REVEALS", label: "⚡ LEAKS & REVEALS" },
            { id: "BANLIST", label: "⛔ BANLIST" },
            { id: "PRODUCTO NUEVO", label: "📦 PRODUCTOS NUEVOS" },
            { id: "TORNEOS & TOPS", label: "🏆 TORNEOS & TOPS" },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`text-[11px] font-bold px-3 py-1.5 transition-all clip-tag-angled ${
                selectedTag === tag.id
                  ? "bg-blue-600 text-white font-black"
                  : "bg-[#0c1220] border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-[#070b14] border border-slate-800 p-16 text-center text-slate-400 space-y-3 clip-chamfer-tr">
          <Newspaper className="w-16 h-16 mx-auto opacity-20 text-yellow-400" />
          <h3 className="text-lg font-black text-white">No hay noticias publicadas para este filtro</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Puedes sincronizar las últimas novedades y reveals desde el panel de administración.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => {
            const isLeak = item.tag.toLowerCase().includes("leak") || item.tag.toLowerCase().includes("reveal");
            const isBanlist = item.tag.toLowerCase().includes("banlist");

            const badgeBg = isBanlist
              ? "bg-red-500/20 text-red-400 border-red-500/40"
              : isLeak
              ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
              : "bg-blue-500/20 text-blue-400 border-blue-500/40";

            return (
              <article
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className="bg-[#070b14] border border-slate-800 hover:border-yellow-400/60 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xl hover:-translate-y-1 hover:shadow-2xl clip-chamfer-tr overflow-hidden"
              >
                <div>
                  {/* Image Container */}
                  <div className="h-48 bg-[#0c1220] relative overflow-hidden flex items-center justify-center border-b border-slate-800">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Newspaper className="w-12 h-12 text-slate-700" />
                    )}

                    {/* Tag Badge */}
                    <span className={`absolute top-2 left-2 text-[9px] font-black uppercase px-2.5 py-1 border shadow clip-tag-angled ${badgeBg}`}>
                      {item.tag}
                    </span>

                    {/* TCG Badge */}
                    {item.tcgSlug && (
                      <span className="absolute top-2 right-2 bg-slate-950/90 text-slate-300 text-[9px] font-black uppercase px-2 py-0.5 border border-slate-800">
                        {item.tcgSlug}
                      </span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>

                      {item.sourceName && (
                        <div className="flex items-center gap-1 text-blue-400">
                          <Globe className="w-3 h-3" />
                          <span>{item.sourceName}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-black text-white text-base group-hover:text-yellow-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-400 group-hover:underline">
                      LEER NOTICIA →
                    </span>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                        title="Ver enlace original"
                      >
                        <ExternalLink className="w-3 h-3" /> Fuente original
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* READING MODAL */}
      {activeModalItem && (
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#070b14] border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar clip-chamfer-tr p-6 sm:p-8 shadow-2xl relative space-y-5"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-yellow-400 text-slate-950 clip-tag-angled">
                  {activeModalItem.tag}
                </span>
                {activeModalItem.tcgSlug && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-800 text-slate-200">
                    {activeModalItem.tcgSlug}
                  </span>
                )}
                <span className="text-xs text-slate-300 font-bold ml-auto pr-8">
                  {formatDate(activeModalItem.publishedAt)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeModalItem.title}
              </h2>
            </div>

            {/* Image */}
            {activeModalItem.imageUrl && (
              <div className="w-full max-h-80 bg-[#0c1220] border border-slate-800 rounded-sm overflow-hidden flex items-center justify-center shadow">
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Content Text */}
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-[#0c1220] p-5 border border-slate-800">
              {activeModalItem.content}
            </div>

            {/* Source Button */}
            {activeModalItem.sourceUrl && (
              <div className="pt-2 flex justify-end">
                <a
                  href={activeModalItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-6 py-3 text-xs tracking-wider clip-btn-tactical shadow-lg shadow-yellow-400/20"
                >
                  <ExternalLink className="w-4 h-4" /> VER EN {activeModalItem.sourceName?.toUpperCase() || "FUENTE ORIGINAL"}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
