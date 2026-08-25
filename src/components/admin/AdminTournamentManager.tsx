"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Trophy, Plus, Trash2, Edit3, X, Upload, Calendar,
  MapPin, Users, Award, Image as ImageIcon, Check, PenTool
} from "lucide-react";
import { createTournament, updateTournament, deleteTournament } from "@/lib/actions";

export interface AdminTournamentItem {
  id: string;
  name: string;
  date: Date | string;
  location?: string | null;
  prize?: string | null;
  photoUrl?: string | null;
  bannerUrl?: string | null;
  participantsCount: number;
  status: string;
  tcgId: string;
  tcg: {
    id: string;
    name: string;
    slug: string;
  };
  decklists: Array<{
    id: string;
    placement: number;
    playerName: string;
  }>;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Próximo (Por realizar)", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  ONGOING: { label: "En Curso (En juego)", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  COMPLETED: { label: "Completado (Finalizado)", color: "text-green-400 bg-green-400/10 border-green-400/30" },
};

export function AdminTournamentManager({
  tournaments,
  tcgs,
}: {
  tournaments: AdminTournamentItem[];
  tcgs: Array<{ id: string; name: string; slug: string }>;
}) {
  const [editingItem, setEditingItem] = useState<AdminTournamentItem | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("La foto del torneo no debe pesar más de 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen banner del torneo no debe pesar más de 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = (t: AdminTournamentItem) => {
    setEditingItem(t);
    setPhotoPreview(t.photoUrl || null);
    setBannerPreview(t.bannerUrl || null);
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setPhotoPreview(null);
    setBannerPreview(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el torneo "${name}"? Se eliminarán también las decklists asociadas.`)) {
      await deleteTournament(id);
      window.location.reload();
    }
  };

  return (
    <div ref={formTopRef} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Trophy className="text-yellow-400 w-8 h-8" /> Gestión de Torneos y Fotos de Ganadores
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Crea torneos, carga las fotos del podio/campeón de tu tienda y administra las decklists de los tops.
        </p>
      </div>

      {/* Form Box */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl relative">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            {editingItem ? (
              <>
                <Edit3 className="w-5 h-5 text-yellow-400" /> Editando Torneo: {editingItem.name}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-yellow-400" /> Crear Nuevo Torneo
              </>
            )}
          </h2>

          {editingItem && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancelar Edición
            </button>
          )}
        </div>

        <form
          action={async (formData) => {
            setIsSaving(true);
            try {
              if (photoPreview) {
                formData.set("photoUrl", photoPreview);
              }
              if (editingItem) {
                formData.set("id", editingItem.id);
                await updateTournament(formData);
              } else {
                await createTournament(formData);
              }
              handleCancelEdit();
              window.location.reload();
            } catch (err) {
              console.error("Error saving tournament:", err);
              alert("Error al guardar el torneo.");
            } finally {
              setIsSaving(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">NOMBRE DEL TORNEO *</label>
              <input
                name="name"
                required
                defaultValue={editingItem?.name || ""}
                placeholder="Ej: Copa Zulia #09 - Yu-Gi-Oh!"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">JUEGO (TCG) *</label>
              <select
                name="tcgId"
                required
                defaultValue={editingItem?.tcgId || tcgs[0]?.id}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all font-bold"
              >
                {tcgs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">FECHA Y HORA *</label>
              <input
                name="date"
                type="datetime-local"
                required
                defaultValue={
                  editingItem?.date
                    ? new Date(editingItem.date).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16)
                }
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">UBICACIÓN / SEDE</label>
              <input
                name="location"
                defaultValue={editingItem?.location || ""}
                placeholder="Ej: CC Galerías Mall, Maracaibo"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">PREMIO A REPARTIR</label>
              <input
                name="prize"
                defaultValue={editingItem?.prize || ""}
                placeholder="Ej: $100 + Playmat Exclusivo"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">N° DE JUGADORES / CUPOS</label>
              <input
                name="participantsCount"
                type="number"
                defaultValue={editingItem?.participantsCount ?? 16}
                min={0}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">ESTADO DEL TORNEO</label>
              <select
                name="status"
                defaultValue={editingItem?.status || "COMPLETED"}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-all font-bold"
              >
                <option value="UPCOMING">Próximo (Por realizar)</option>
                <option value="ONGOING">En Curso (En juego)</option>
                <option value="COMPLETED">Completado (Finalizado)</option>
              </select>
            </div>

            {/* Photo Upload Section */}
            <div className="md:col-span-2 xl:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Foto Torneo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-white flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-yellow-400" /> FOTO DEL TORNEO / FOTO DEL PODIO O CAMPEÓN
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Sube la foto que tomaste al ganador o podio en la tienda. Se mostrará en el inicio y en el historial con el nombre del campeón integrado.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border border-slate-700 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-yellow-400" /> Subir Foto de PC
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
                    >
                      Quitar
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <input
                  name="photoUrl"
                  value={photoPreview || ""}
                  onChange={(e) => setPhotoPreview(e.target.value)}
                  placeholder="O pega una URL externa de la imagen (https://...)"
                  className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Banner Image Section (Background of tournament card) */}
            <div className="md:col-span-2 xl:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-14 rounded bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow relative">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner Torneo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-400" /> IMAGEN BANNER TORNEO (FONDO DE LA CARD)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Imagen o arte temático que aparecerá como fondo de la tarjeta del torneo con efecto difuminado para no restar legibilidad a los textos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border border-slate-700 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" /> Subir Banner de PC
                  </button>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={() => setBannerPreview(null)}
                      className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
                    >
                      Quitar
                    </button>
                  )}
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <input
                  name="bannerUrl"
                  value={bannerPreview || ""}
                  onChange={(e) => setBannerPreview(e.target.value)}
                  placeholder="O pega una URL externa para el banner (https://...)"
                  className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded text-xs focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-3 rounded-lg text-xs transition-colors tracking-widest shadow-lg shadow-yellow-400/20 disabled:opacity-50"
            >
              {isSaving
                ? "GUARDANDO..."
                : editingItem
                ? "GUARDAR CAMBIOS DEL TORNEO"
                : "CREAR TORNEO"}
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
                <div
                  key={t.id}
                  className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail if photo exists */}
                    <div className="w-14 h-16 bg-slate-950 border border-slate-700 rounded overflow-hidden flex items-center justify-center shrink-0 shadow">
                      {t.photoUrl ? (
                        <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <Trophy className="w-6 h-6 text-yellow-400/60" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
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

                      <h3 className="font-black text-white text-base md:text-lg truncate">{t.name}</h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(t.date).toLocaleDateString("es-VE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {t.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {t.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Link
                      href={`/admin/decks?tournamentId=${t.id}&tcgId=${t.tcgId}`}
                      className="bg-yellow-400/10 hover:bg-yellow-400 hover:text-slate-950 text-yellow-400 border border-yellow-400/30 text-xs font-black px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Cargar Tops ({topsCount})
                    </Link>

                    <button
                      onClick={() => handleStartEdit(t)}
                      className="p-2 bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-300 rounded-lg transition-colors"
                      title="Editar Torneo y Foto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="p-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                      title="Eliminar Torneo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
