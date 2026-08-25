"use client";

import { useState, useRef } from "react";
import {
  Store, MessageSquare, Globe, Plus, Trash2, Upload,
  Image as ImageIcon, Check, RefreshCw, X, ExternalLink, MapPin, Phone, Clock
} from "lucide-react";
import { FaWhatsapp, FaDiscord, FaTiktok, FaYoutube, FaInstagram } from "react-icons/fa";
import { createLocalStore, deleteLocalStore, createCommunityGroup, deleteCommunityGroup, updateSiteSocials } from "@/lib/actions";

interface LocalStoreItem {
  id: string;
  name: string;
  location: string;
  description?: string | null;
  phone?: string | null;
  instagramUrl?: string | null;
  schedule?: string | null;
  logoUrl?: string | null;
}

interface CommunityGroupItem {
  id: string;
  name: string;
  tcgName: string;
  inviteUrl: string;
  description?: string | null;
}

interface AdminCommunityManagerProps {
  stores: LocalStoreItem[];
  groups: CommunityGroupItem[];
  socials: Record<string, string>;
}

export function AdminCommunityManager({ stores, groups, socials }: AdminCommunityManagerProps) {
  const [activeTab, setActiveTab] = useState<"stores" | "groups" | "socials">("stores");

  // --- STORE FORM STATE ---
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [storeMapsUrl, setStoreMapsUrl] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeInstagram, setStoreInstagram] = useState("");
  const [storeSchedule, setStoreSchedule] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLogoPreview, setStoreLogoPreview] = useState<string | null>(null);
  const [storeLogoUrl, setStoreLogoUrl] = useState("");
  const [storeUploadMode, setStoreUploadMode] = useState<"file" | "url">("file");
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [storeSuccess, setStoreSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- GROUP FORM STATE ---
  const [groupName, setGroupName] = useState("");
  const [groupTcg, setGroupTcg] = useState("Yu-Gi-Oh!");
  const [groupInviteUrl, setGroupInviteUrl] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [groupSuccess, setGroupSuccess] = useState(false);

  // --- SOCIALS FORM STATE ---
  const [instagramUrl, setInstagramUrl] = useState(socials.instagram_url || "");
  const [tiktokUrl, setTiktokUrl] = useState(socials.tiktok_url || "");
  const [discordUrl, setDiscordUrl] = useState(socials.discord_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(socials.youtube_url || "");
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState(socials.whatsapp_group_url || "");
  const [whatsappNumber, setWhatsappNumber] = useState(socials.whatsapp_number || "");
  const [isSubmittingSocials, setIsSubmittingSocials] = useState(false);
  const [socialsSuccess, setSocialsSuccess] = useState(false);

  // Handle Logo Upload
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("El logo o banner debe pesar menos de 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setStoreLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeLocation) {
      alert("Completa el nombre y la ubicación de la tienda.");
      return;
    }

    setIsSubmittingStore(true);
    try {
      const formData = new FormData();
      formData.append("name", storeName);
      formData.append("location", storeLocation);
      formData.append("mapsUrl", storeMapsUrl);
      formData.append("phone", storePhone);
      formData.append("instagramUrl", storeInstagram);
      formData.append("schedule", storeSchedule);
      formData.append("description", storeDescription);
      if (storeLogoPreview) {
        formData.append("logoUrl", storeLogoPreview);
      }

      await createLocalStore(formData);
      setStoreName("");
      setStoreLocation("");
      setStoreMapsUrl("");
      setStorePhone("");
      setStoreInstagram("");
      setStoreSchedule("");
      setStoreDescription("");
      setStoreLogoPreview(null);
      setStoreLogoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStoreSuccess(true);
      setTimeout(() => setStoreSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating store:", err);
      alert("Error al guardar la tienda.");
    } finally {
      setIsSubmittingStore(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !groupInviteUrl) {
      alert("Completa el nombre del grupo y el enlace de WhatsApp.");
      return;
    }

    setIsSubmittingGroup(true);
    try {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("tcgName", groupTcg);
      formData.append("inviteUrl", groupInviteUrl);
      formData.append("description", groupDescription);

      await createCommunityGroup(formData);
      setGroupName("");
      setGroupInviteUrl("");
      setGroupDescription("");
      setGroupSuccess(true);
      setTimeout(() => setGroupSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Error al guardar el grupo.");
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSocials(true);
    try {
      const formData = new FormData();
      formData.append("instagram_url", instagramUrl);
      formData.append("tiktok_url", tiktokUrl);
      formData.append("discord_url", discordUrl);
      formData.append("youtube_url", youtubeUrl);
      formData.append("whatsapp_group_url", whatsappGroupUrl);
      formData.append("whatsapp_number", whatsappNumber);

      await updateSiteSocials(formData);
      setSocialsSuccess(true);
      setTimeout(() => setSocialsSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving socials:", err);
      alert("Error al guardar las redes.");
    } finally {
      setIsSubmittingSocials(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-3 shadow-xl flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all ${
            activeTab === "stores"
              ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20 scale-105"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Store className="w-4 h-4" /> TIENDAS Y SEDES ({stores.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all ${
            activeTab === "groups"
              ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20 scale-105"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <FaWhatsapp className="w-4 h-4 text-emerald-400" /> GRUPOS DE WHATSAPP ({groups.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("socials")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all ${
            activeTab === "socials"
              ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20 scale-105"
              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" /> REDES OFICIALES ZULIA TCG
        </button>
      </div>

      {/* TAB 1: STORES AND VENUES */}
      {activeTab === "stores" && (
        <div className="space-y-8">
          {/* Add Store Form */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-yellow-400" /> Registrar Tienda o Sede Aliada
            </h2>

            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    NOMBRE DE LA TIENDA *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ej: Card Capitol Maracaibo"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    UBICACIÓN / DIRECCIÓN FÍSICA *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    placeholder="Ej: CC Galerías Mall, Nivel 2, Local 45"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    ENLACE DE GOOGLE MAPS (OPCIONAL)
                  </label>
                  <input
                    type="url"
                    value={storeMapsUrl}
                    onChange={(e) => setStoreMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/... o https://google.com/maps/..."
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    TELÉFONO / WHATSAPP DE CONTACTO
                  </label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="Ej: +58 412 1234567"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    INSTAGRAM DE LA TIENDA
                  </label>
                  <input
                    type="text"
                    value={storeInstagram}
                    onChange={(e) => setStoreInstagram(e.target.value)}
                    placeholder="Ej: https://instagram.com/tutienda"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    HORARIO DE ATENCIÓN / TORNEOS
                  </label>
                  <input
                    type="text"
                    value={storeSchedule}
                    onChange={(e) => setStoreSchedule(e.target.value)}
                    placeholder="Ej: Mar a Sáb: 1:00 PM - 8:00 PM"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    BREVE DESCRIPCIÓN
                  </label>
                  <input
                    type="text"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Ej: Venta de singles, boosters y torneos semanales"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                {/* Logo / Image Upload Section */}
                <div className="md:col-span-2 lg:col-span-3 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-slate-300 tracking-wider">
                      LOGO O FOTO DE LA TIENDA
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStoreUploadMode("file")}
                        className={`text-[10px] font-bold px-3 py-1 rounded-md transition-colors ${
                          storeUploadMode === "file" ? "bg-yellow-400 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        Subir desde PC
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoreUploadMode("url")}
                        className={`text-[10px] font-bold px-3 py-1 rounded-md transition-colors ${
                          storeUploadMode === "url" ? "bg-yellow-400 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        Pegar Enlace URL
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                      {storeUploadMode === "file" ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-700 hover:border-yellow-400 rounded-xl p-5 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center gap-1.5"
                        >
                          <Upload className="w-6 h-6 text-yellow-400/80" />
                          <p className="text-xs font-bold text-slate-200">
                            Haz clic para seleccionar el logo desde tu PC
                          </p>
                          <p className="text-[10px] text-slate-500">PNG, JPG, WEBP (hasta 4MB)</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileChange}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div>
                          <input
                            type="url"
                            value={storeLogoUrl}
                            onChange={(e) => {
                              setStoreLogoUrl(e.target.value);
                              setStoreLogoPreview(e.target.value.trim() || null);
                            }}
                            placeholder="https://ejemplo.com/logo-tienda.png"
                            className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-xl border border-slate-800 min-h-[100px] relative">
                      {storeLogoPreview ? (
                        <>
                          <img
                            src={storeLogoPreview}
                            alt="Preview Logo"
                            className="max-h-20 w-auto object-contain rounded-lg shadow"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setStoreLogoPreview(null);
                              setStoreLogoUrl("");
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center text-slate-600">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                          <span className="text-[10px] font-semibold">Sin logo cargado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmittingStore}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-2.5 rounded-lg text-xs transition-colors tracking-widest disabled:opacity-50"
                >
                  {storeSuccess ? <Check className="w-4 h-4 text-green-900" /> : isSubmittingStore ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                  {storeSuccess ? "¡TIENDA GUARDADA!" : isSubmittingStore ? "GUARDANDO..." : "REGISTRAR TIENDA"}
                </button>
              </div>
            </form>
          </div>

          {/* Stores List */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
              <h3 className="font-black text-white text-lg">Tiendas y Sedes Publicadas ({stores.length})</h3>
            </div>

            {stores.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold text-sm">
                No hay tiendas registradas. Usa el formulario de arriba para agregar la primera.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {stores.map((s) => (
                  <div key={s.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative group">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {s.logoUrl ? (
                            <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-yellow-400/70" />
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h4 className="font-black text-white text-sm truncate">{s.name}</h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> {s.location}
                          </p>
                        </div>
                      </div>

                      {s.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{s.description}</p>}

                      <div className="space-y-1 text-xs text-slate-400 font-medium">
                        {s.phone && (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <Phone className="w-3.5 h-3.5 shrink-0" /> {s.phone}
                          </div>
                        )}
                        {s.schedule && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> {s.schedule}
                          </div>
                        )}
                        {s.instagramUrl && (
                          <div className="flex items-center gap-1.5 text-purple-400 truncate">
                            <FaInstagram className="w-3.5 h-3.5 shrink-0" /> {s.instagramUrl}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                      <form
                        action={async () => {
                          await deleteLocalStore(s.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMMUNITY WHATSAPP GROUPS */}
      {activeTab === "groups" && (
        <div className="space-y-8">
          {/* Add Group Form */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Registrar Grupo de WhatsApp de la Comunidad
            </h2>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    NOMBRE DEL GRUPO *
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ej: Yu-Gi-Oh! Maracaibo Oficial"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    JUEGO / CATEGORÍA *
                  </label>
                  <select
                    value={groupTcg}
                    onChange={(e) => setGroupTcg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-bold"
                  >
                    <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
                    <option value="One Piece">One Piece</option>
                    <option value="Digimon">Digimon</option>
                    <option value="GENERAL">Comunidad General / TCGs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    ENLACE DE INVITACIÓN DE WHATSAPP *
                  </label>
                  <input
                    type="url"
                    required
                    value={groupInviteUrl}
                    onChange={(e) => setGroupInviteUrl(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                    DESCRIPCIÓN O PROPÓSITO DEL GRUPO (OPCIONAL)
                  </label>
                  <input
                    type="text"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Ej: Compra, venta, debates del metagame y pactar duelos en la ciudad"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmittingGroup}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-2.5 rounded-lg text-xs transition-colors tracking-widest disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {groupSuccess ? <Check className="w-4 h-4 text-green-950" /> : isSubmittingGroup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FaWhatsapp className="w-4 h-4" />}
                  {groupSuccess ? "¡GRUPO REGISTRADO!" : isSubmittingGroup ? "GUARDANDO..." : "AGREGAR GRUPO"}
                </button>
              </div>
            </form>
          </div>

          {/* Groups List */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
              <h3 className="font-black text-white text-lg">Grupos de WhatsApp Publicados ({groups.length})</h3>
            </div>

            {groups.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold text-sm">
                No hay grupos de WhatsApp registrados. Usa el formulario para agregar los enlaces de los grupos.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {groups.map((g) => (
                  <div key={g.id} className="p-5 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <FaWhatsapp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {g.tcgName}
                          </span>
                          <h4 className="font-black text-white text-sm">{g.name}</h4>
                        </div>
                        {g.description && <p className="text-xs text-slate-400 mt-0.5">{g.description}</p>}
                        <a
                          href={g.inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-1 truncate"
                        >
                          {g.inviteUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <form
                      action={async () => {
                        await deleteCommunityGroup(g.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                        title="Eliminar grupo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL ZULIA TCG SOCIAL LINKS */}
      {activeTab === "socials" && (
        <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="font-black text-white text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" /> Redes Sociales y Canales Oficiales de Zulia TCG
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Estos enlaces se muestran en el pie de página, en la sección de Comunidad y en el inicio del sitio web.
            </p>
          </div>

          <form onSubmit={handleSaveSocials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                  <FaInstagram className="w-4 h-4 text-purple-400" /> INSTAGRAM OFICIAL
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/zulia_tcg"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                  <FaTiktok className="w-4 h-4 text-pink-400" /> TIKTOK OFICIAL
                </label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@zulia_tcg"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                  <FaDiscord className="w-4 h-4 text-indigo-400" /> SERVIDOR DE DISCORD
                </label>
                <input
                  type="url"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.gg/zulia-tcg"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                  <FaYoutube className="w-4 h-4 text-red-500" /> CANAL DE YOUTUBE
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@zulia_tcg"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                  <FaWhatsapp className="w-4 h-4 text-emerald-400" /> GRUPO OFICIAL PRINCIPAL DE WHATSAPP
                </label>
                <input
                  type="url"
                  value={whatsappGroupUrl}
                  onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                  <FaWhatsapp className="w-4 h-4 text-emerald-400" /> NÚMERO DE WHATSAPP DE ATENCIÓN
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="584121234567"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmittingSocials}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-3 rounded-lg text-xs transition-colors tracking-widest disabled:opacity-50 shadow-lg shadow-yellow-400/20"
              >
                {socialsSuccess ? <Check className="w-4 h-4 text-green-900" /> : isSubmittingSocials ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {socialsSuccess ? "¡REDES GUARDADAS!" : isSubmittingSocials ? "GUARDANDO..." : "GUARDAR REDES OFICIALES"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
