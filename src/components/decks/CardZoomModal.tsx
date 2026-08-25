"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn } from "lucide-react";

export interface ZoomCardItem {
  id?: string | number;
  name: string;
  image_url: string;
  type?: string;
  desc?: string;
}

interface CardZoomModalProps {
  card: ZoomCardItem | null;
  onClose: () => void;
}

export function CardZoomModal({ card, onClose }: CardZoomModalProps) {
  useEffect(() => {
    if (!card) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, onClose]);

  if (!card || typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 cursor-zoom-out"
      style={{ margin: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm sm:max-w-md md:max-w-lg w-full flex flex-col items-center cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-12 right-0 sm:-right-4 p-2 bg-slate-900/90 hover:bg-yellow-400 hover:text-slate-950 text-white rounded-full border border-slate-700 transition-all shadow-xl cursor-pointer"
          title="Cerrar vista previa (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Artwork in Large High Resolution */}
        <div className="w-full aspect-[3/4.3] max-h-[75vh] bg-slate-950 rounded-lg overflow-hidden border-2 border-yellow-400/80 shadow-[0_0_50px_rgba(250,204,21,0.3)] relative group">
          <img
            src={card.image_url}
            alt={card.name}
            className="w-full h-full object-contain filter drop-shadow-2xl"
          />
        </div>

        {/* Card Name Caption */}
        <div className="mt-4 bg-[#070b14]/90 border border-slate-700 px-5 py-2.5 rounded-lg text-center max-w-full shadow-lg">
          <h3 className="font-black text-white text-base sm:text-lg truncate tracking-wide">
            {card.name}
          </h3>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5 flex items-center justify-center gap-1.5">
            <ZoomIn className="w-3 h-3 text-yellow-400" /> Clic afuera o presiona Esc para cerrar
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
