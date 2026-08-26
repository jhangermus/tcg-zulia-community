"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({
  slug,
  name,
  compact = false,
}: {
  slug?: string | null;
  name: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = slug
      ? `${window.location.origin}/torneos/${slug}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `¡Únete al torneo ${name} en Zulia TCG!`,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share window closed
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar enlace:", err);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleShare}
        title="Compartir enlace del torneo"
        className="p-2 bg-slate-800/90 hover:bg-slate-700 text-yellow-400 border border-slate-700 rounded transition-colors backdrop-blur-sm flex items-center justify-center shrink-0 cursor-pointer shadow-md"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Share2 className="w-4 h-4 text-yellow-400" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 text-xs rounded transition-colors border border-slate-700 shadow-md cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-black">¡ENLACE COPIADO!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-yellow-400" />
          <span>COMPARTIR ENLACE DE TORNEO</span>
        </>
      )}
    </button>
  );
}
