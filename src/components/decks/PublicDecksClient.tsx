"use client";

import { useState } from "react";
import { Trophy, Layers, Sparkles, Shield, X, Eye, Calendar, User, MapPin } from "lucide-react";

export interface DeckCardItem {
  id: string | number;
  name: string;
  image_url: string;
}

export interface DecklistItem {
  id: string;
  playerName: string;
  deckName: string;
  placement: number;
  tournamentName: string;
  tournamentDate?: string;
  tcgName: string;
  tcgSlug: string;
  tcgColor?: string | null;
  createdAt: string;
  deckData: {
    main: DeckCardItem[];
    extra: DeckCardItem[];
    side: DeckCardItem[];
  };
}

interface PublicDecksClientProps {
  decks: DecklistItem[];
  tcgs: Array<{ id: string; name: string; slug: string; color?: string | null }>;
}

export function PublicDecksClient({ decks, tcgs }: PublicDecksClientProps) {
  const [selectedTcg, setSelectedTcg] = useState<string>("ALL");
  const [activeModalDeck, setActiveModalDeck] = useState<DecklistItem | null>(null);
  const [hoveredCard, setHoveredCard] = useState<DeckCardItem | null>(null);

  // Filter decks
  const filteredDecks = decks.filter((deck) => {
    if (selectedTcg === "ALL") return true;
    return deck.tcgSlug === selectedTcg || deck.tcgName.toLowerCase() === selectedTcg.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* TCG Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTcg("ALL")}
          className={`font-black text-xs px-5 py-2.5 rounded-xl transition-all ${
            selectedTcg === "ALL"
              ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20 scale-105"
              : "bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          TODOS ({decks.length})
        </button>
        {tcgs.map((tcg) => {
          const count = decks.filter((d) => d.tcgSlug === tcg.slug || d.tcgName === tcg.name).length;
          const isSelected = selectedTcg === tcg.slug || selectedTcg === tcg.name;
          return (
            <button
              key={tcg.id}
              onClick={() => setSelectedTcg(tcg.slug)}
              className={`font-bold text-xs px-5 py-2.5 rounded-xl border transition-all ${
                isSelected
                  ? "bg-yellow-400 text-slate-950 border-yellow-400 shadow-lg shadow-yellow-400/20 scale-105 font-black"
                  : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {tcg.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid of Decks */}
      {filteredDecks.length === 0 ? (
        <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-16 text-center text-slate-500 space-y-3">
          <Trophy className="w-16 h-16 mx-auto opacity-20 text-yellow-400" />
          <h3 className="text-lg font-black text-white">No hay Top Decks publicados todavía</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Los mazos campeones de los torneos oficiales se publicarán aquí desde el panel de administración.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => {
            const isOP = deck.tcgSlug.includes("one") || deck.tcgSlug.includes("piece") || deck.tcgSlug.includes("op");
            const isDigi = deck.tcgSlug.includes("digi");
            const isYgo = !isOP && !isDigi;

            const extraLabel = isOP ? "Líder" : isDigi ? "Digi-Egg" : "Extra";
            const mainCount = deck.deckData.main.length;
            const extraCount = deck.deckData.extra.length;
            const sideCount = deck.deckData.side.length;

            const themeBorder = isYgo
              ? "hover:border-red-500/60 border-slate-800"
              : isOP
              ? "hover:border-purple-500/60 border-slate-800"
              : "hover:border-blue-500/60 border-slate-800";

            const badgeBg = isYgo
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : isOP
              ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30";

            // Extract key card names
            const keyCards = deck.deckData.main.slice(0, 4);

            return (
              <div
                key={deck.id}
                onClick={() => {
                  setActiveModalDeck(deck);
                  setHoveredCard(deck.deckData.main[0] || deck.deckData.extra[0] || null);
                }}
                className={`bg-[#0a0e17] border ${themeBorder} rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xl hover:shadow-2xl hover:-translate-y-1`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${badgeBg}`}>
                      {deck.tcgName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">{deck.createdAt}</span>
                      <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 font-black text-xs">TOP {deck.placement}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deck Title & Pilot */}
                  <h3 className="font-black text-xl text-white group-hover:text-yellow-400 transition-colors line-clamp-1 mb-1">
                    {deck.deckName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-5">
                    Piloto: <span className="text-slate-200 font-bold">{deck.playerName}</span> • {deck.tournamentName}
                  </p>

                  {/* Card Counts (Congruent per TCG) */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 mb-5 text-center text-xs">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">MAIN</p>
                      <p className="font-black text-white text-sm mt-0.5">{mainCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{extraLabel}</p>
                      <p className="font-black text-blue-400 text-sm mt-0.5">{extraCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">SIDE</p>
                      <p className="font-black text-purple-400 text-sm mt-0.5">{isYgo ? sideCount : 0}</p>
                    </div>
                  </div>

                  {/* Key Cards Tags */}
                  {keyCards.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">CARTAS CLAVE</p>
                      <div className="flex flex-wrap gap-1.5">
                        {keyCards.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md truncate max-w-[140px]"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-yellow-400/90 group-hover:text-yellow-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Ver Decklist Completa
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Verificado</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL DECKLIST DETAIL MODAL */}
      {activeModalDeck && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          onClick={() => setActiveModalDeck(null)}
        >
          <div
            className="bg-[#0a0e17] border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-yellow-400 text-slate-950 uppercase">
                    {activeModalDeck.tcgName}
                  </span>
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded-full">
                    Top {activeModalDeck.placement}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">{activeModalDeck.deckName}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-500" /> {activeModalDeck.playerName}
                  </span>
                  <span>•</span>
                  <span>{activeModalDeck.tournamentName}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveModalDeck(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Cards Grids (span 8) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Main Deck */}
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-yellow-400" /> MAIN DECK ({activeModalDeck.deckData.main.length})
                  </h4>
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {activeModalDeck.deckData.main.map((card, i) => (
                      <div
                        key={`${card.id}-${i}`}
                        onMouseEnter={() => setHoveredCard(card)}
                        onClick={() => setHoveredCard(card)}
                        className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-yellow-400 transition-all cursor-pointer shadow hover:scale-105"
                      >
                        <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra / Líder / Digi-Egg */}
                {activeModalDeck.deckData.extra.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />{" "}
                      {activeModalDeck.tcgSlug.includes("one")
                        ? "LÍDER / DON!!"
                        : activeModalDeck.tcgSlug.includes("digi")
                        ? "DIGI-EGG DECK"
                        : "EXTRA DECK"}{" "}
                      ({activeModalDeck.deckData.extra.length})
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {activeModalDeck.deckData.extra.map((card, i) => (
                        <div
                          key={`${card.id}-${i}`}
                          onMouseEnter={() => setHoveredCard(card)}
                          onClick={() => setHoveredCard(card)}
                          className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-blue-400 transition-all cursor-pointer shadow hover:scale-105"
                        >
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Deck */}
                {activeModalDeck.deckData.side.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" /> SIDE DECK ({activeModalDeck.deckData.side.length})
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {activeModalDeck.deckData.side.map((card, i) => (
                        <div
                          key={`${card.id}-${i}`}
                          onMouseEnter={() => setHoveredCard(card)}
                          onClick={() => setHoveredCard(card)}
                          className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-purple-400 transition-all cursor-pointer shadow hover:scale-105"
                        >
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Card Preview Zoom (span 4) */}
              <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center sticky top-0">
                {hoveredCard ? (
                  <div className="space-y-3 text-center w-full">
                    <div className="aspect-[3/4] max-w-[240px] mx-auto bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                      <img src={hoveredCard.image_url} alt={hoveredCard.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-white">{hoveredCard.name}</h5>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">ID: {hoveredCard.id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-12">
                    Pasa el cursor sobre cualquier carta para verla en tamaño completo.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
