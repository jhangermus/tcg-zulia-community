"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy, Medal, Award, Calendar, Layers, ArrowLeft,
  Eye, User, Sparkles, MessageSquare, Gamepad2, MapPin, Shield, X, ZoomIn
} from "lucide-react";
import { CardZoomModal } from "@/components/decks/CardZoomModal";

export interface DeckCardItem {
  id: string | number;
  name: string;
  image_url: string;
}

export interface PlayerDeckItem {
  id: string;
  playerName: string;
  deckName: string | null;
  placement: number;
  isRecommended: boolean;
  deckData: string;
  adminNotes?: string | null;
  coverImageUrl?: string | null;
  createdAt: Date | string;
  tournament?: {
    id: string;
    name: string;
    date: Date | string;
    location?: string | null;
  } | null;
  tcg: {
    id: string;
    name: string;
    slug: string;
  };
}

export function PlayerProfileClient({
  playerName,
  decks,
}: {
  playerName: string;
  decks: PlayerDeckItem[];
}) {
  const [activeDeckModal, setActiveDeckModal] = useState<PlayerDeckItem | null>(null);
  const [hoveredCard, setHoveredCard] = useState<DeckCardItem | null>(null);
  const [zoomedCard, setZoomedCard] = useState<DeckCardItem | null>(null);

  // Exclude non-competitive from points, but include in decks list
  const competitiveDecks = decks.filter((d) => !d.isRecommended && d.placement > 0);

  // Compute stats
  let totalPoints = 0;
  let winsCount = 0;
  let finalsCount = 0;
  let top4Count = 0;
  let top8Count = 0;

  const tcgPointsMap: Record<string, number> = {};

  for (const d of competitiveDecks) {
    let pts = 10;
    if (d.placement === 1) {
      pts = 100;
      winsCount++;
    } else if (d.placement === 2) {
      pts = 75;
      finalsCount++;
    } else if (d.placement <= 4) {
      pts = 50;
      top4Count++;
    } else if (d.placement <= 8) {
      pts = 25;
      top8Count++;
    }
    totalPoints += pts;

    const tcgKey = d.tcg.name;
    tcgPointsMap[tcgKey] = (tcgPointsMap[tcgKey] || 0) + pts;
  }

  // Cover image: first deck cover or default
  const playerAvatar =
    decks.find((d) => d.coverImageUrl)?.coverImageUrl || null;

  const getParsedDeckData = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      return {
        main: (parsed.main || []) as DeckCardItem[],
        extra: (parsed.extra || []) as DeckCardItem[],
        side: (parsed.side || []) as DeckCardItem[],
      };
    } catch {
      return { main: [], extra: [], side: [] };
    }
  };

  const activeParsedData = activeDeckModal ? getParsedDeckData(activeDeckModal.deckData) : null;

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/ranking"
          className="inline-flex items-center gap-2 text-xs font-black text-yellow-400 hover:text-yellow-300 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER AL RANKING
        </Link>
      </div>

      {/* Profile Banner */}
      <div className="bg-[#070b14] border border-slate-800 p-6 md:p-8 clip-chamfer-tr shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-24 h-32 bg-slate-950 border-2 border-yellow-400 rounded-sm overflow-hidden flex items-center justify-center shrink-0 shadow-xl clip-chamfer-tr">
              {playerAvatar ? (
                <img src={playerAvatar} alt={playerName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-yellow-400" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-yellow-400 text-slate-950 clip-tag-angled">
                  DUELISTA COMPETITIVO
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tight">
                {playerName}
              </h1>
              <p className="text-xs text-slate-400 font-bold">
                Comunidad Zulia TCG • {competitiveDecks.length} Torneo(s) Registrado(s)
              </p>
            </div>
          </div>

          {/* Points Badge */}
          <div className="bg-[#0c1220] border border-yellow-400/50 p-5 clip-chamfer-tr text-center shrink-0 shadow-lg">
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block">
              PUNTOS TOTALES
            </span>
            <span className="text-4xl font-black text-yellow-400 block drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">
              {totalPoints}
            </span>
            <span className="text-[10px] text-yellow-400 font-bold uppercase">RANKING GENERAL</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-[#0c1220] border border-slate-800 p-3 clip-tag-angled">
            <span className="text-[10px] text-slate-400 font-bold block">🥇 CAMPEONATOS</span>
            <span className="text-xl font-black text-yellow-400">{winsCount}</span>
          </div>
          <div className="bg-[#0c1220] border border-slate-800 p-3 clip-tag-angled">
            <span className="text-[10px] text-slate-400 font-bold block">🥈 FINALISTA</span>
            <span className="text-xl font-black text-slate-200">{finalsCount}</span>
          </div>
          <div className="bg-[#0c1220] border border-slate-800 p-3 clip-tag-angled">
            <span className="text-[10px] text-slate-400 font-bold block">🥉 TOP 4</span>
            <span className="text-xl font-black text-amber-500">{top4Count}</span>
          </div>
          <div className="bg-[#0c1220] border border-slate-800 p-3 clip-tag-angled">
            <span className="text-[10px] text-slate-400 font-bold block">🎖️ TOP 8</span>
            <span className="text-xl font-black text-blue-400">{top8Count}</span>
          </div>
        </div>

        {/* Points By TCG */}
        {Object.keys(tcgPointsMap).length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Desglose por TCG:</span>
            {Object.entries(tcgPointsMap).map(([tcgName, pts]) => (
              <span key={tcgName} className="bg-slate-900 border border-slate-700 px-3 py-1 text-slate-200 clip-tag-angled">
                {tcgName}: <strong className="text-yellow-400">{pts} pts</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Decks & Tournaments History */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-yellow-400" /> Historial de Mazos y Participaciones ({decks.length})
        </h2>

        {decks.length === 0 ? (
          <div className="bg-[#070b14] border border-slate-800 p-12 text-center text-slate-500 clip-chamfer-tr">
            <p className="font-bold">No hay decks registrados para este jugador aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => {
              const isWin = deck.placement === 1;
              const isFinal = deck.placement === 2;
              const isTop4 = deck.placement > 2 && deck.placement <= 4;
              const isTop8 = deck.placement > 4 && deck.placement <= 8;

              const badgeText = deck.isRecommended
                ? "⭐ GUÍA RECOMENDADA"
                : isWin
                ? "🥇 1ER LUGAR (CAMPEÓN)"
                : isFinal
                ? "🥈 FINALISTA (2DO LUGAR)"
                : isTop4
                ? `🥉 TOP ${deck.placement}`
                : isTop8
                ? `🎖️ TOP ${deck.placement}`
                : "PARTICIPACIÓN";

              const badgeBg = deck.isRecommended
                ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                : isWin
                ? "bg-yellow-400 text-slate-950"
                : isFinal
                ? "bg-slate-300 text-slate-950"
                : "bg-slate-800 text-slate-300";

              return (
                <div
                  key={deck.id}
                  className="bg-[#070b14] border border-slate-800 hover:border-yellow-400/60 p-5 clip-chamfer-tr transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 clip-tag-angled ${badgeBg}`}>
                        {badgeText}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300">
                        {deck.tcg.name}
                      </span>
                    </div>

                    {/* Deck Cover & Title */}
                    <div className="flex gap-3.5 items-center">
                      <div className="w-14 h-18 bg-slate-950 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center shrink-0 shadow">
                        {deck.coverImageUrl ? (
                          <img src={deck.coverImageUrl} alt={deck.deckName || "Deck"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <Layers className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-white text-base group-hover:text-yellow-400 transition-colors line-clamp-2">
                          {deck.deckName || "Decklist sin nombre"}
                        </h3>
                        {deck.tournament && (
                          <p className="text-xs text-slate-400 font-bold truncate mt-0.5">
                            Torneo: {deck.tournament.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Notes if any */}
                    {deck.adminNotes && (
                      <p className="text-xs text-slate-400 line-clamp-2 italic bg-[#0c1220] p-2 border border-slate-800">
                        "{deck.adminNotes}"
                      </p>
                    )}
                  </div>

                  {/* Footer Button */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(deck.createdAt).toLocaleDateString("es-VE")}
                    </span>
                    <button
                      onClick={() => {
                        setActiveDeckModal(deck);
                        const parsed = getParsedDeckData(deck.deckData);
                        setHoveredCard(parsed.main[0] || parsed.extra[0] || null);
                      }}
                      className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-4 py-2 text-xs clip-btn-tactical transition-colors shadow"
                    >
                      <Eye className="w-3.5 h-3.5" /> VER DECKLIST
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Deck Modal */}
      {activeDeckModal && activeParsedData && (
        <div
          onClick={() => setActiveDeckModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#070b14] border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar clip-chamfer-tr p-5 sm:p-8 shadow-2xl relative space-y-6"
          >
            <button
              onClick={() => setActiveDeckModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase px-3 py-1 bg-yellow-400 text-slate-950 clip-tag-angled">
                  {activeDeckModal.isRecommended ? "⭐ RECOMENDADA" : `TOP #${activeDeckModal.placement}`}
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-800 text-slate-200">
                  {activeDeckModal.tcg.name}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeDeckModal.deckName || "Decklist"}
              </h2>

              <p className="text-xs text-slate-300 font-bold">
                Piloto: <strong className="text-yellow-400">{activeDeckModal.playerName}</strong>
                {activeDeckModal.tournament && ` • Torneo: ${activeDeckModal.tournament.name}`}
              </p>
            </div>

            {activeDeckModal.adminNotes && (
              <div className="bg-[#0c1220] border border-slate-800 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="font-black text-yellow-400 block mb-1">NOTAS DEL ADMIN:</span>
                {activeDeckModal.adminNotes}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Card Preview */}
              <div className="lg:col-span-4 bg-[#0c1220] border border-slate-800 p-4 space-y-3 hidden lg:block">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">CARTA SELECCIONADA</h4>
                {hoveredCard ? (
                  <div className="space-y-3">
                    <div
                      onClick={() => setZoomedCard(hoveredCard)}
                      title="Clic para ampliar y leer carta"
                      className="aspect-[3/4] bg-slate-950 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all group relative"
                    >
                      <img src={hoveredCard.image_url} alt={hoveredCard.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-black">
                        <ZoomIn className="w-6 h-6 text-yellow-400" />
                        <span>AMPLIAR CARTA</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{hoveredCard.name}</p>
                      <p className="text-[10px] text-yellow-400 font-bold mt-0.5 flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" /> Clic para zoom completo
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Haz clic en cualquier carta para ampliar</p>
                )}
              </div>

              {/* Zones */}
              <div className="lg:col-span-8 space-y-5">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-yellow-400" /> MAIN DECK ({activeParsedData.main.length})
                  </h4>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {activeParsedData.main.map((card, i) => (
                      <div
                        key={`${card.id}-${i}`}
                        onClick={() => {
                          setHoveredCard(card);
                          setZoomedCard(card);
                        }}
                        title={`${card.name} (Clic para ampliar)`}
                        className="aspect-[3/4] bg-slate-950 border border-slate-700 hover:border-yellow-400 rounded-sm overflow-hidden cursor-pointer group relative"
                      >
                        <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <ZoomIn className="w-4 h-4 text-yellow-400 drop-shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {activeParsedData.extra.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> EXTRA / LÍDER / DIGI-EGG ({activeParsedData.extra.length})
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {activeParsedData.extra.map((card, i) => (
                        <div
                          key={`${card.id}-${i}`}
                          onClick={() => {
                            setHoveredCard(card);
                            setZoomedCard(card);
                          }}
                          title={`${card.name} (Clic para ampliar)`}
                          className="aspect-[3/4] bg-slate-950 border border-blue-700 hover:border-blue-400 rounded-sm overflow-hidden cursor-pointer group relative"
                        >
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="w-4 h-4 text-blue-400 drop-shadow" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeParsedData.side.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> SIDE DECK ({activeParsedData.side.length})
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {activeParsedData.side.map((card, i) => (
                        <div
                          key={`${card.id}-${i}`}
                          onClick={() => {
                            setHoveredCard(card);
                            setZoomedCard(card);
                          }}
                          title={`${card.name} (Clic para ampliar)`}
                          className="aspect-[3/4] bg-slate-950 border border-purple-700 hover:border-purple-400 rounded-sm overflow-hidden cursor-pointer group relative"
                        >
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="w-4 h-4 text-purple-400 drop-shadow" />
                          </div>
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

      {/* Card Zoom Modal */}
      <CardZoomModal card={zoomedCard} onClose={() => setZoomedCard(null)} />
    </div>
  );
}
