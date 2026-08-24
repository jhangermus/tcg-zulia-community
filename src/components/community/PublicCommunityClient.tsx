"use client";

import { useState } from "react";
import { Store, MessageCircle, MapPin, Phone, Clock, ExternalLink, Users, ArrowRight } from "lucide-react";
import { FaWhatsapp, FaDiscord, FaTiktok, FaYoutube, FaInstagram } from "react-icons/fa";

export interface PublicStoreItem {
  id: string;
  name: string;
  location: string;
  description?: string | null;
  phone?: string | null;
  instagramUrl?: string | null;
  schedule?: string | null;
  logoUrl?: string | null;
}

export interface PublicGroupItem {
  id: string;
  name: string;
  tcgName: string;
  inviteUrl: string;
  description?: string | null;
}

interface PublicCommunityClientProps {
  stores: PublicStoreItem[];
  groups: PublicGroupItem[];
  socials: Record<string, string>;
}

export function PublicCommunityClient({ stores, groups, socials }: PublicCommunityClientProps) {
  const [activeTab, setActiveTab] = useState<"stores" | "groups">("stores");
  const [selectedGroupTcg, setSelectedGroupTcg] = useState<string>("ALL");

  const filteredGroups = groups.filter((g) => {
    if (selectedGroupTcg === "ALL") return true;
    return g.tcgName.toLowerCase() === selectedGroupTcg.toLowerCase();
  });

  return (
    <div className="space-y-10">
      {/* 1. OFFICIAL ZULIA TCG SOCIAL CHANNELS */}
      <section className="bg-gradient-to-r from-[#001736] via-[#0a0e17] to-[#040914] border border-blue-900/40 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">
                CANALES OFICIALES
              </span>
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tight text-white mt-2">
                ÚNETE A LA COMUNIDAD DE <span className="text-yellow-400">ZULIA TCG</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Conéctate con jugadores de todo el estado Zulia, entérate de torneos, compra/venta de cartas y debate sobre el metagame.
              </p>
            </div>

            {socials.whatsapp_group_url && (
              <a
                href={socials.whatsapp_group_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-105 shrink-0"
              >
                <FaWhatsapp className="w-4 h-4" /> GRUPO OFICIAL DE WHATSAPP
              </a>
            )}
          </div>

          {/* Social Links Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {socials.instagram_url && (
              <a
                href={socials.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 p-3.5 rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <FaInstagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Instagram</span>
                  <span className="text-xs font-black text-white group-hover:text-purple-300">@zulia_tcg</span>
                </div>
              </a>
            )}

            {socials.tiktok_url && (
              <a
                href={socials.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-900/80 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/50 p-3.5 rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <FaTiktok className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">TikTok</span>
                  <span className="text-xs font-black text-white group-hover:text-pink-300">@zulia_tcg</span>
                </div>
              </a>
            )}

            {socials.discord_url && (
              <a
                href={socials.discord_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <FaDiscord className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Discord</span>
                  <span className="text-xs font-black text-white group-hover:text-indigo-300">Servidor Oficial</span>
                </div>
              </a>
            )}

            {socials.youtube_url && (
              <a
                href={socials.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-900/80 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/50 p-3.5 rounded-xl transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <FaYoutube className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">YouTube</span>
                  <span className="text-xs font-black text-white group-hover:text-red-300">Canal Oficial</span>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY HUBS: TABS FOR STORES & WHATSAPP GROUPS */}
      <section className="space-y-6">
        {/* Tab Controls */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === "stores"
                ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20 scale-105"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Store className="w-4 h-4" /> TIENDAS Y SEDES ({stores.length})
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
              activeTab === "groups"
                ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20 scale-105"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <FaWhatsapp className="w-4 h-4 text-emerald-400" /> GRUPOS DE WHATSAPP ({groups.length})
          </button>
        </div>

        {/* TAB CONTENT: STORES */}
        {activeTab === "stores" && (
          <div>
            {stores.length === 0 ? (
              <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-16 text-center text-slate-500 space-y-3">
                <Store className="w-16 h-16 mx-auto opacity-20 text-yellow-400" />
                <h3 className="text-lg font-black text-white">No hay tiendas registradas aún</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Pronto listaremos las tiendas y sedes oficiales de cartas y torneos en Maracaibo y el Zulia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="bg-[#0a0e17] border border-slate-800 hover:border-yellow-400/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl hover:-translate-y-1 hover:shadow-2xl group"
                  >
                    <div>
                      {/* Logo and Name */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow">
                          {store.logoUrl ? (
                            <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-7 h-7 text-yellow-400/70" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black text-white text-lg group-hover:text-yellow-400 transition-colors truncate">
                            {store.name}
                          </h3>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            Sede Oficial
                          </span>
                        </div>
                      </div>

                      {store.description && (
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{store.description}</p>
                      )}

                      {/* Store Details */}
                      <div className="space-y-2.5 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 mb-5">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                          <span className="font-medium">{store.location}</span>
                        </div>

                        {store.schedule && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                            <span>{store.schedule}</span>
                          </div>
                        )}

                        {store.phone && (
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <Phone className="w-4 h-4 shrink-0" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-slate-800/80">
                      {store.phone && (
                        <a
                          href={`https://wa.me/${store.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-black transition-all"
                        >
                          <FaWhatsapp className="w-3.5 h-3.5" /> CONTACTAR
                        </a>
                      )}

                      {store.instagramUrl && (
                        <a
                          href={store.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 bg-purple-500/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 py-2.5 rounded-xl text-xs font-black transition-all"
                          title="Ver Instagram"
                        >
                          <FaInstagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: WHATSAPP GROUPS */}
        {activeTab === "groups" && (
          <div className="space-y-6">
            {/* TCG Sub-Filter */}
            <div className="flex flex-wrap gap-2">
              {["ALL", "Yu-Gi-Oh!", "One Piece", "Digimon", "GENERAL"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedGroupTcg(filter)}
                  className={`text-xs font-black px-4 py-2 rounded-lg border transition-all ${
                    selectedGroupTcg === filter
                      ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {filter === "ALL" ? "TODOS LOS GRUPOS" : filter}
                </button>
              ))}
            </div>

            {filteredGroups.length === 0 ? (
              <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-16 text-center text-slate-500 space-y-3">
                <FaWhatsapp className="w-16 h-16 mx-auto opacity-20 text-emerald-400" />
                <h3 className="text-lg font-black text-white">No hay grupos registrados para este filtro</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Los enlaces de invitación a los grupos de WhatsApp oficiales se gestionan desde el panel de administración.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-[#0a0e17] border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl hover:-translate-y-1 hover:shadow-2xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {group.tcgName}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <FaWhatsapp className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className="font-black text-white text-lg group-hover:text-emerald-400 transition-colors mb-2">
                        {group.name}
                      </h3>

                      <p className="text-xs text-slate-400 mb-6">
                        {group.description || "Grupo de comunidad oficial para organizar partidas, intercambios y novedades."}
                      </p>
                    </div>

                    <a
                      href={group.inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                    >
                      <FaWhatsapp className="w-4 h-4" /> UNIRSE AL GRUPO
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
