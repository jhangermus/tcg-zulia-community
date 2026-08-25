"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, ExternalLink, Store, Clock } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const modalContent = isOpen && mounted ? (
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      style={{ margin: 0, padding: "1rem" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#070b14] border-2 border-yellow-400/60 w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar clip-chamfer-tr p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center text-yellow-400 shadow">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg sm:text-xl">Tiendas y Sedes en el Zulia</h3>
              <p className="text-xs text-slate-300 font-bold">Selecciona una tienda para abrir su ubicación exacta en Google Maps</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-sm transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store List */}
        {stores.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Store className="w-12 h-12 mx-auto opacity-30 text-yellow-400" />
            <p className="font-black text-base text-white">Pronto se agregarán las sedes oficiales</p>
            <p className="text-xs text-slate-400">Puedes consultarlas también en la sección de Comunidad.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
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
                  className="bg-[#0c1220] border border-slate-800 hover:border-yellow-400/80 p-4 sm:p-5 clip-chamfer-tr transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Store Logo */}
                    <div className="w-14 h-14 bg-slate-950 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center shrink-0 shadow">
                      {s.logoUrl ? (
                        <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-7 h-7 text-yellow-400" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-black text-white text-base truncate group-hover:text-yellow-400 transition-colors">
                        {s.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <span className="truncate">{s.location}</span>
                      </div>
                      {s.schedule && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{s.schedule}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Google Maps Link Button */}
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-5 py-2.5 text-xs tracking-wider clip-btn-tactical transition-all shadow-md shadow-yellow-400/20 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> ABRIR EN GOOGLE MAPS
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  ) : null;

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

      {/* Render via React Portal on top of everything in document.body */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
