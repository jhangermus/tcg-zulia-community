"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, Layers, Search, Eye, Calendar, User,
  MessageSquare, Star, ArrowRight, Shield, X
} from "lucide-react";
import { DeckCardItem } from "./PublicDecksClient";

export interface RecommendedDeckItem {
  id: string;
  playerName: string;
  deckName: string;
  tcgName: string;
  tcgSlug: string;
  tcgColor?: string | null;
  adminNotes?: string | null;
  coverImageUrl?: string | null;
  createdAt: string;
  deckData: {
    main: DeckCardItem[];
    extra: DeckCardItem[];
    side: DeckCardItem[];
  };
}

interface PublicRecommendedDecksClientProps {
  decks: RecommendedDeckItem[];
  tcgs: Array<{ id: string; name: string; slug: string; color?: string | null }>;
}

export function PublicRecommendedDecksClient({
  decks,
  tcgs,
}: PublicRecommendedDecksClientProps) {
  const [selectedTcg, setSelectedTcg] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalDeck, setActiveModalDeck] = useState<RecommendedDeckItem | null>(null);
  const [hoveredCard, setHoveredCard] = useState<DeckCardItem | null>(null);

  // Filter decks
  const filteredDecks = decks.filter((deck) => {
    const matchTcg =
      selectedTcg === "ALL" ||
      deck.tcgSlug === selectedTcg ||
      deck.tcgName.toLowerCase() === selectedTcg.toLowerCase();

    const matchSearch =
      searchQuery.trim() === "" ||
      deck.deckName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.adminNotes && deck.adminNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchTcg && matchSearch;
  });

  const getCoverImage = (deck: RecommendedDeckItem) => {
    if (deck.coverImageUrl) return deck.coverImageUrl;
    return deck.deckData.main?.[0]?.image_url || deck.deckData.extra?.[0]?.image_url || null;
  };

  return (
    <div className="space-y-8">
      {/* Header Controls: Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* TCG Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTcg("ALL")}
            className={`font-black text-xs px-5 py-2.5 transition-all clip-chamfer-tr ${
              selectedTcg === "ALL"
                ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                : "bg-[#0a0f1d] hover:bg-slate-800 border border-slate-700 text-slate-200"
            }`}
          >
            TODOS LOS JUEGOS
          </button>
          {tcgs.map((tcg) => (
            <button
              key={tcg.id}
              onClick={() => setSelectedTcg(tcg.slug)}
              className={`font-black text-xs px-5 py-2.5 transition-all clip-chamfer-tr ${
                selectedTcg === tcg.slug
                  ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                  : "bg-[#0a0f1d] hover:bg-slate-800 border border-slate-700 text-slate-200"
              }`}
            >
              {tcg.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por arquetipo o autor..."
            className="w-full bg-[#0a0f1d] border border-slate-700 text-white pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-yellow-400 clip-chamfer-tr"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="bg-[#070b14] border border-slate-800 p-16 text-center text-slate-400 space-y-3 clip-chamfer-tr">
          <Sparkles className="w-16 h-16 mx-auto opacity-20 text-yellow-400" />
          <h3 className="text-lg font-black text-white">No hay decklists recomendadas en esta categoría</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Pronto los jueces y duelistas expertos compartirán nuevas listas optimizadas, tech cards y guías de metagame.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => {
            const cover = getCoverImage(deck);
            return (
              <div
                key={deck.id}
                onClick={() => {
                  setActiveModalDeck(deck);
                  setHoveredCard(deck.deckData.main[0] || null);
                }}
                className="bg-[#070b14] border border-slate-800 hover:border-yellow-400/60 p-6 clip-chamfer-tr flex flex-col justify-between group shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-blue-600/20 border border-blue-500/40 text-blue-400 clip-tag-angled">
                      ⭐ RECOMENDADA
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-200">
                      {deck.tcgName}
                    </span>
                  </div>

                  {/* Artwork Cover & Title */}
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-22 bg-[#0c1220] border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                      {cover ? (
                        <img
                          src={cover}
                          alt={deck.deckName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Layers className="w-8 h-8 text-slate-600" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-lg text-white group-hover:text-yellow-400 transition-colors line-clamp-2 leading-snug">
                        {deck.deckName}
                      </h3>
                      <Link
                        href={`/jugador/${encodeURIComponent(deck.playerName)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-slate-300 font-bold hover:text-yellow-400 flex items-center gap-1.5 mt-1"
                      >
                        <User className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="truncate">Por: {deck.playerName}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Admin Commentary / Guide Excerpt */}
                  {deck.adminNotes && (
                    <div className="bg-[#0c1220] border border-slate-800/80 p-3 text-xs text-slate-300 italic line-clamp-3">
                      "{deck.adminNotes}"
                    </div>
                  )}

                  {/* Card Counts */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span className="text-slate-200">{deck.deckData.main.length} Main</span>
                    {deck.deckData.extra.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400">{deck.deckData.extra.length} Extra</span>
                      </>
                    )}
                    {deck.deckData.side.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-purple-400">{deck.deckData.side.length} Side</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer Button */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">
                    {new Date(deck.createdAt).toLocaleDateString("es-VE")}
                  </span>
                  <button className="flex items-center gap-1.5 bg-yellow-400 group-hover:bg-yellow-500 text-slate-950 font-black px-4 py-2 text-xs clip-btn-tactical transition-colors shadow">
                    <Eye className="w-3.5 h-3.5" /> VER DECKLIST
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Deck View Modal */}
      {activeModalDeck && (
        <div
          onClick={() => setActiveModalDeck(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#070b14] border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar clip-chamfer-tr p-5 sm:p-8 shadow-2xl relative space-y-6"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalDeck(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-blue-600 text-white clip-tag-angled">
                  ⭐ GUÍA RECOMENDADA
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-800 text-slate-200">
                  {activeModalDeck.tcgName}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeModalDeck.deckName}
              </h2>

              <p className="text-xs text-slate-300 font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-yellow-400" /> Creador / Autor:{" "}
                <Link
                  href={`/jugador/${encodeURIComponent(activeModalDeck.playerName)}`}
                  className="text-yellow-400 hover:underline font-black"
                >
                  {activeModalDeck.playerName}
                </Link>
              </p>
            </div>

            {/* Guide notes */}
            {activeModalDeck.adminNotes && (
              <div className="bg-[#0c1220] border border-slate-800 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="font-black text-yellow-400 block mb-1">NOTAS Y ESTRATEGIA:</span>
                {activeModalDeck.adminNotes}
              </div>
            )}

            {/* Deck Cards Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Card Preview (Fixed) */}
              <div className="lg:col-span-4 bg-[#0c1220] border border-slate-800 p-4 space-y-3 hidden lg:block">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">CARTA SELECCIONADA</h4>
                {hoveredCard ? (
                  <div className="space-y-3">
                    <div className="aspect-[3/4] bg-slate-950 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center">
                      <img src={hoveredCard.image_url} alt={hoveredCard.name} className="w-full h-full object-contain" />
                    </div>
                    <p className="text-sm font-black text-white">{hoveredCard.name}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Haz clic en cualquier carta para ampliar</p>
                )}
              </div>

              {/* Deck Zones */}
              <div className="lg:col-span-8 space-y-5">
                {/* Main Deck */}
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-yellow-400" /> MAIN DECK ({activeModalDeck.deckData.main.length})
                  </h4>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {activeModalDeck.deckData.main.map((card, i) => (
                      <div
                        key={`${card.id}-${i}`}
                        onClick={() => setHoveredCard(card)}
                        title={card.name}
                        className="aspect-[3/4] bg-slate-950 border border-slate-700 hover:border-yellow-400 rounded-sm overflow-hidden cursor-pointer group"
                      >
                        <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Deck */}
                {activeModalDeck.deckData.extra.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> EXTRA / LÍDER / DIGI-EGG ({activeModalDeck.deckData.extra.length})
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {activeModalDeck.deckData.extra.map((card, i) => (
                        <div
                          key={`${card.id}-${i}`}
                          onClick={() => setHoveredCard(card)}
                          title={card.name}
                          className="aspect-[3/4] bg-slate-950 border border-blue-700 hover:border-blue-400 rounded-sm overflow-hidden cursor-pointer group"
                        >
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Deck */}
                {activeModalDeck.deckData.side.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> SIDE DECK ({activeModalDeck.deckData.side.length})
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {activeModalDeck.deckData.side.map((card, i) => (
                        <div
                          key={`${card.id}-${i}`}
                          onClick={() => setHoveredCard(card)}
                          title={card.name}
                          className="aspect-[3/4] bg-slate-950 border border-purple-700 hover:border-purple-400 rounded-sm overflow-hidden cursor-pointer group"
                        >
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
