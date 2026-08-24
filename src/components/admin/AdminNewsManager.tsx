"use client";

import { useState, useRef } from "react";
import { Newspaper, Plus, Trash2, Edit3, Eye, EyeOff, RefreshCw, Upload, Globe, Calendar, ExternalLink, Tag } from "lucide-react";
import { createNews, updateNews, deleteNews, toggleNewsPublished, syncExternalNewsAction } from "@/lib/actions";

export interface AdminNewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  tag: string;
  tcgSlug?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  published: boolean;
  publishedAt: Date | string;
  createdAt: Date | string;
}

const TAG_OPTIONS = [
  "LEAKS & REVEALS",
  "BANLIST",
  "PRODUCTO NUEVO",
  "TORNEOS & TOPS",
  "DECK PROFILE",
  "COMUNIDAD",
  "ANUNCIO",
  "NOTICIAS",
];

const TCG_OPTIONS = [
  { slug: "yugioh", name: "Yu-Gi-Oh!" },
  { slug: "one-piece", name: "One Piece" },
  { slug: "digimon", name: "Digimon" },
  { slug: "general", name: "General / Todas" },
];

export function AdminNewsManager({ initialNews }: { initialNews: AdminNewsItem[] }) {
  const [news, setNews] = useState<AdminNewsItem[]>(initialNews);
  const [editingItem, setEditingItem] = useState<AdminNewsItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle local image upload from PC
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen no debe superar los 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Sync external news (YGOrganization & Digimon)
  const handleSyncFeeds = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncExternalNewsAction();
      setSyncStatus(`¡Sincronización exitosa! Se importaron ${res.createdCount} noticias nuevas de ${res.totalFound} encontradas.`);
      window.location.reload();
    } catch (error) {
      setSyncStatus("Error al sincronizar noticias externas.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Pre-load item for edition
  const handleEdit = (item: AdminNewsItem) => {
    setEditingItem(item);
    setImagePreview(item.imageUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setImagePreview(null);
    formRef.current?.reset();
  };

  const filteredNews = news.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.sourceName && n.sourceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    n.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Sync Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0f1d] border border-slate-800 p-6 clip-chamfer-tr shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Newspaper className="text-green-400 w-8 h-8" /> Gestión de Noticias y Leaks
          </h1>
          <p className="text-slate-300 mt-1 text-xs font-semibold">
            Publica noticias manuales, sube imágenes desde tu PC o sincroniza Leaks & Reveals de YGOrganization y Digimon.
          </p>
        </div>

        <button
          onClick={handleSyncFeeds}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-6 py-3 text-xs tracking-wider clip-btn-tactical transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "SINCRONIZANDO..." : "⚡ IMPORTAR DE YGORGANIZATION & DIGIMON"}
        </button>
      </div>

      {syncStatus && (
        <div className="bg-emerald-950/60 border border-emerald-500/60 p-4 text-xs font-bold text-emerald-300 clip-chamfer-tr">
          {syncStatus}
        </div>
      )}

      {/* Form: Create or Edit News */}
      <div className="bg-[#070b14] border border-slate-800 p-6 clip-chamfer-tr shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            {editingItem ? (
              <>
                <Edit3 className="w-5 h-5 text-yellow-400" /> Editando Noticia: {editingItem.title}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-green-400" /> Nueva Noticia / Anuncio
              </>
            )}
          </h2>

          {editingItem && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-slate-400 hover:text-white font-bold underline"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        <form
          ref={formRef}
          action={async (formData) => {
            if (imagePreview) {
              formData.set("imageUrl", imagePreview);
            }
            if (editingItem) {
              formData.set("id", editingItem.id);
              await updateNews(formData);
            } else {
              await createNews(formData);
            }
            handleCancelEdit();
            window.location.reload();
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <div className="md:col-span-3">
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider">
                TÍTULO DE LA NOTICIA / REVEAL *
              </label>
              <input
                name="title"
                required
                defaultValue={editingItem?.title || ""}
                placeholder="Ej: [OCG] Nuevos Reveals para el Próximo Booster Pack"
                className="w-full bg-[#0c1220] border border-slate-700 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all clip-chamfer-tr"
              />
            </div>

            {/* Tag / Category */}
            <div>
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider">
                CATEGORÍA / ETIQUETA
              </label>
              <select
                name="tag"
                defaultValue={editingItem?.tag || "LEAKS & REVEALS"}
                className="w-full bg-[#0c1220] border border-slate-700 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all clip-chamfer-tr"
              >
                {TAG_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* TCG Association */}
            <div>
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider">
                JUEGO (TCG)
              </label>
              <select
                name="tcgSlug"
                defaultValue={editingItem?.tcgSlug || "yugioh"}
                className="w-full bg-[#0c1220] border border-slate-700 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all clip-chamfer-tr"
              >
                {TCG_OPTIONS.map((tcg) => (
                  <option key={tcg.slug} value={tcg.slug}>
                    {tcg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Date */}
            <div>
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-yellow-400" /> FECHA DE PUBLICACIÓN
              </label>
              <input
                type="date"
                name="publishedAt"
                defaultValue={
                  editingItem?.publishedAt
                    ? new Date(editingItem.publishedAt).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                className="w-full bg-[#0c1220] border border-slate-700 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all clip-chamfer-tr"
              />
            </div>

            {/* Source Name & URL (for Reposts / YGOrganization) */}
            <div>
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> NOMBRE DE FUENTE (opcional)
              </label>
              <input
                name="sourceName"
                defaultValue={editingItem?.sourceName || ""}
                placeholder="Ej: YGOrganization, Digimon Meta..."
                className="w-full bg-[#0c1220] border border-slate-700 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all clip-chamfer-tr"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> ENLACE ORIGINAL / FUENTE (opcional)
              </label>
              <input
                name="sourceUrl"
                defaultValue={editingItem?.sourceUrl || ""}
                placeholder="https://ygorganization.com/..."
                className="w-full bg-[#0c1220] border border-slate-700 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all clip-chamfer-tr"
              />
            </div>

            {/* Image Upload / URL */}
            <div className="md:col-span-3">
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider">
                IMAGEN DESTACADA (SUBIR DE PC O PEGAR URL)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  name="imageUrl"
                  value={imagePreview || ""}
                  onChange={(e) => setImagePreview(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-[#0c1220] border border-slate-700 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all clip-chamfer-tr"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-[#0a0f1d] hover:bg-slate-800 border border-slate-600 px-4 py-2.5 text-xs font-black text-white transition-colors clip-btn-tactical shrink-0"
                >
                  <Upload className="w-4 h-4 text-yellow-400" /> SUBIR DESDE MI PC
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </div>

              {imagePreview && (
                <div className="mt-3 w-32 h-20 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden relative shadow">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-[9px] px-1 rounded font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              <label className="block text-xs font-black text-slate-200 mb-2 tracking-wider">
                CONTENIDO / DETALLES DE LA NOTICIA *
              </label>
              <textarea
                name="content"
                required
                rows={4}
                defaultValue={editingItem?.content || ""}
                placeholder="Escribe los detalles, efectos de cartas, información de banlist o fechas..."
                className="w-full bg-[#0c1220] border border-slate-700 text-white p-3 text-sm focus:outline-none focus:border-green-400 transition-all resize-y clip-chamfer-tr"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            {editingItem && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 text-xs tracking-wider clip-btn-tactical"
              >
                CANCELAR
              </button>
            )}
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-slate-950 font-black px-8 py-3 text-xs tracking-wider clip-btn-tactical shadow-lg shadow-green-500/20"
            >
              {editingItem ? "💾 GUARDAR CAMBIOS" : "PUBLICAR NOTICIA"}
            </button>
          </div>
        </form>
      </div>

      {/* News List */}
      <div className="bg-[#070b14] border border-slate-800 clip-chamfer-tr overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="font-black text-white text-lg">Publicaciones Guardadas ({news.length})</h2>
            <span className="text-xs text-slate-400">Incluye noticias manuales y reposts de YGOrganization y Digimon.</span>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título o fuente..."
            className="bg-[#0c1220] border border-slate-700 text-white px-3 py-1.5 text-xs max-w-xs focus:outline-none focus:border-yellow-400 clip-chamfer-tr"
          />
        </div>

        {filteredNews.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="font-bold">No se encontraron publicaciones.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:bg-slate-800/20 transition-colors"
              >
                {/* Image */}
                <div className="w-20 h-14 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center shrink-0 shadow">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Newspaper className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 clip-tag-angled">
                      {item.tag}
                    </span>
                    {item.tcgSlug && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-800 text-slate-300">
                        {item.tcgSlug}
                      </span>
                    )}
                    {item.sourceName && (
                      <span className="text-[9px] font-semibold text-blue-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {item.sourceName}
                      </span>
                    )}
                    {!item.published && (
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5">
                        OCULTA
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-white text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{item.content}</p>
                  <p className="text-slate-500 text-[10px] mt-1 font-bold">
                    Publicado: {new Date(item.publishedAt).toLocaleDateString("es-VE", { dateStyle: "medium" })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-300 transition-colors clip-chamfer-tr"
                    title="Editar Noticia"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={async () => {
                      await toggleNewsPublished(item.id, !item.published);
                      setNews((prev) =>
                        prev.map((n) => (n.id === item.id ? { ...n, published: !n.published } : n))
                      );
                    }}
                    title={item.published ? "Ocultar de la web" : "Hacer visible"}
                    className={`p-2 transition-colors clip-chamfer-tr ${
                      item.published
                        ? "bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-slate-950"
                        : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    {item.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm("¿Estás seguro de eliminar esta noticia?")) {
                        await deleteNews(item.id);
                        setNews((prev) => prev.filter((n) => n.id !== item.id));
                      }
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white transition-colors clip-chamfer-tr"
                    title="Eliminar Noticia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
