"use client";

import { useState } from "react";
import { MapPin, X, ExternalLink, Store, Clock, Phone } from "lucide-react";

export interface StoreLocationItem {
  id: string;
  name: string;
  location: string;
  mapsUrl?: string | null;
  logoUrl?: string | null;
  schedule?: string | null;
  phone?: string | null;
}

export function LocationModal({ stores }: { stores: StoreLocationItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Clickable Location Box on Sidebar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full text-left flex items-center gap-3 bg-[#0a0f1d] hover:bg-slate-800/80 p-2.5 border border-slate-700 hover:border-yellow-400/80 clip-chamfer-tr transition-all shadow-sm group cursor-pointer"
        title="Ver tiendas y sedes en Google Maps"
      >
        <MapPin className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-black text-white group-hover:text-yellow-400 transition-colors tracking-wider leading-tight">
            MARACAIBO
          </span>
          <span className="text-[10px] text-slate-200 font-bold tracking-tight leading-tight flex items-center gap-1">
            ZULIA, VENEZUELA <span className="text-[9px] text-yellow-400 underline">VER MAPAS</span>
          </span>
        </div>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#070b14] border border-slate-700 w-full max-w-xl max-h-[85vh] overflow-y-auto custom-scrollbar clip-chamfer-tr p-6 sm:p-7 shadow-2xl relative space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Tiendas y Sedes en el Zulia</h3>
                  <p className="text-xs text-slate-400 font-semibold">Selecciona una tienda para abrir su ubicación en Google Maps</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Store List */}
            {stores.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Store className="w-10 h-10 mx-auto opacity-30 text-yellow-400" />
                <p className="font-bold text-sm text-slate-300">Pronto se agregarán las sedes oficiales</p>
                <p className="text-xs text-slate-500">Puedes consultarlas también en la sección de Comunidad.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map((s) => {
                  const mapsLink =
                    s.mapsUrl && s.mapsUrl.trim() !== ""
                      ? s.mapsUrl
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${s.name} ${s.location} Maracaibo`
                        )}`;

                  return (
                    <div
                      key={s.id}
                      className="bg-[#0c1220] border border-slate-800 hover:border-yellow-400/60 p-4 clip-chamfer-tr transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Store Logo */}
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                          {s.logoUrl ? (
                            <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-yellow-400/80" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-black text-white text-sm truncate">{s.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-slate-300 font-bold mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                            <span className="truncate">{s.location}</span>
                          </div>
                          {s.schedule && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{s.schedule}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Google Maps Button */}
                      <a
                        href={mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-4 py-2 text-xs tracking-wider clip-btn-tactical transition-all shadow shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> GOOGLE MAPS
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
