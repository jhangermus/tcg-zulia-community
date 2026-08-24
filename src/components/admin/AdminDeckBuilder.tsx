"use client";

import { useState, useEffect, useTransition } from "react";
import {
  PenTool, Search, Plus, Trash2, Save,
  Layers, Sparkles, RefreshCw, Check, Shield
} from "lucide-react";
import { createDecklist } from "@/lib/actions";

interface Card {
  id: string | number;
  name: string;
  type?: string;
  image_url: string;
  slot?: "main" | "extra" | "side" | "leader" | "egg";
}

interface AdminDeckBuilderProps {
  tournaments: Array<{ id: string; name: string; tcgId: string }>;
  tcgs: Array<{ id: string; name: string; slug: string }>;
}

export function AdminDeckBuilder({ tournaments, tcgs }: AdminDeckBuilderProps) {
  const [selectedTcgId, setSelectedTcgId] = useState(tcgs[0]?.id || "");
  const [selectedTournamentId, setSelectedTournamentId] = useState(tournaments[0]?.id || "");
  const [playerName, setPlayerName] = useState("");
  const [deckName, setDeckName] = useState("");
  const [placement, setPlacement] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [mainDeck, setMainDeck] = useState<Card[]>([]);
  const [extraDeck, setExtraDeck] = useState<Card[]>([]);
  const [sideDeck, setSideDeck] = useState<Card[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Get active TCG info
  const activeTcg = tcgs.find((t) => t.id === selectedTcgId) || tcgs[0];
  const tcgSlug = activeTcg?.slug || activeTcg?.name?.toLowerCase() || "yugioh";

  const isOnePiece = tcgSlug.includes("one") || tcgSlug.includes("piece") || tcgSlug.includes("op");
  const isDigimon = tcgSlug.includes("digi");
  const isYugioh = !isOnePiece && !isDigimon;

  const extraTitle = isOnePiece ? "LÍDER" : isDigimon ? "DIGI-EGG DECK" : "EXTRA DECK";
  const extraBtn = isOnePiece ? "+ Líder" : isDigimon ? "+ Egg" : "+ Extra";

  // Perform search
  const performSearch = async (query: string, currentSlug: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/cards?tcg=${encodeURIComponent(currentSlug)}&q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.cards && Array.isArray(data.cards)) {
        setSearchResults(data.cards);
        if (data.cards[0]) {
          setSelectedCard(data.cards[0]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching cards:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Initial card search when TCG changes
  useEffect(() => {
    const defaultQueries: Record<string, string> = {
      yugioh: "Ash Blossom",
      onepiece: "Luffy",
      digimon: "Greymon",
    };
    const key = isOnePiece ? "onepiece" : isDigimon ? "digimon" : "yugioh";
    const initialQ = defaultQueries[key] || "a";
    setSearchQuery(initialQ);
    performSearch(initialQ, tcgSlug);
  }, [selectedTcgId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, tcgSlug);
  };

  const addCard = (card: Card, target: "main" | "extra" | "side" = "main") => {
    if (target === "extra") {
      setExtraDeck((prev) => [...prev, card]);
    } else if (target === "side") {
      setSideDeck((prev) => [...prev, card]);
    } else {
      setMainDeck((prev) => [...prev, card]);
    }
  };

  const removeCard = (index: number, from: "main" | "extra" | "side") => {
    if (from === "main") {
      setMainDeck((prev) => prev.filter((_, i) => i !== index));
    } else if (from === "extra") {
      setExtraDeck((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSideDeck((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Submit to Server Action
  const handleSaveDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !deckName || !selectedTournamentId || !selectedTcgId) {
      alert("Por favor completa todos los campos del formulario.");
      return;
    }

    if (mainDeck.length === 0) {
      alert("Debes agregar al menos una carta al mazo antes de guardar.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("playerName", playerName);
      formData.append("deckName", deckName);
      formData.append("placement", placement.toString());
      formData.append("tournamentId", selectedTournamentId);
      formData.append("tcgId", selectedTcgId);
      formData.append(
        "deckData",
        JSON.stringify({
          main: mainDeck.map((c) => ({ id: c.id, name: c.name, image_url: c.image_url })),
          extra: extraDeck.map((c) => ({ id: c.id, name: c.name, image_url: c.image_url })),
          side: sideDeck.map((c) => ({ id: c.id, name: c.name, image_url: c.image_url })),
        })
      );

      await createDecklist(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving deck:", err);
      alert("Ocurrió un error al guardar el decklist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Form: Tournament and Player Details */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="font-black text-white text-lg mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-yellow-400" /> Información del Top Deck
        </h2>

        <form onSubmit={handleSaveDeck} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">TORNEO *</label>
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">TCG / JUEGO *</label>
            <select
              value={selectedTcgId}
              onChange={(e) => setSelectedTcgId(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-bold"
            >
              {tcgs.map((tcg) => (
                <option key={tcg.id} value={tcg.id}>{tcg.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">JUGADOR (PILOTO) *</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej: Jhanger U."
              required
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">NOMBRE DEL DECK *</label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Ej: Snake-Eye / Red Luffy"
              required
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">POSICIÓN / TOP *</label>
            <select
              value={placement}
              onChange={(e) => setPlacement(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
            >
              <option value={1}>1er Lugar (Campeón)</option>
              <option value={2}>2do Lugar (Finalista)</option>
              <option value={3}>Top 4 (3er Lugar)</option>
              <option value={4}>Top 4 (4to Lugar)</option>
              <option value={8}>Top 8</option>
            </select>
          </div>

          <div className="lg:col-span-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400">
              Cartas en mazo: <span className="text-white font-extrabold">{mainDeck.length} Main</span>
              {extraDeck.length > 0 && (
                <> • <span className="text-blue-400 font-extrabold">{extraDeck.length} {extraTitle}</span></>
              )}
              {sideDeck.length > 0 && (
                <> • <span className="text-purple-400 font-extrabold">{sideDeck.length} Side</span></>
              )}
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-6 py-2.5 rounded-lg text-xs transition-colors tracking-widest disabled:opacity-50"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-green-900" /> : <Save className="w-4 h-4" />}
              {savedSuccess ? "¡TOP DECK GUARDADO!" : isSaving ? "GUARDANDO..." : "GUARDAR TOP DECK EN BD"}
            </button>
          </div>
        </form>
      </div>

      {/* 3-Col Studio Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Card Preview (span 3) */}
        <div className="lg:col-span-3 bg-[#0a0e17] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase">VISTA PREVIA</h3>
          {selectedCard ? (
            <div className="space-y-3">
              <div className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                {selectedCard.image_url ? (
                  <img src={selectedCard.image_url} alt={selectedCard.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-slate-600 text-xs">Sin imagen</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{selectedCard.name}</h4>
                <p className="text-[10px] text-yellow-400 font-bold mt-0.5">{selectedCard.type}</p>
                <p className="text-[9px] text-slate-500">ID: {selectedCard.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => addCard(selectedCard, "main")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs py-2 rounded transition-colors"
                >
                  + Main
                </button>
                <button
                  type="button"
                  onClick={() => addCard(selectedCard, "extra")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-2 rounded transition-colors"
                >
                  {extraBtn}
                </button>
                {isYugioh && (
                  <button
                    type="button"
                    onClick={() => addCard(selectedCard, "side")}
                    className="col-span-2 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs py-1.5 rounded transition-colors border border-purple-500/30"
                  >
                    + Side Deck
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">Selecciona una carta de los resultados para previsualizarla.</p>
          )}
        </div>

        {/* Deck Grid (span 6) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Deck */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-yellow-400" /> MAIN DECK ({mainDeck.length})
              </h3>
              {mainDeck.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMainDeck([])}
                  className="text-[10px] text-slate-500 hover:text-red-400 font-semibold"
                >
                  Limpiar Main
                </button>
              )}
            </div>

            {mainDeck.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-800/80 rounded-lg text-slate-600 text-xs">
                Usa el buscador a la derecha para agregar cartas al Main Deck
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {mainDeck.map((card, i) => (
                  <div
                    key={`${card.id}-${i}`}
                    onClick={() => removeCard(i, "main")}
                    onMouseEnter={() => setSelectedCard(card)}
                    className="aspect-[3/4] bg-slate-900 rounded overflow-hidden border border-slate-700 hover:border-red-500 cursor-pointer relative group"
                  >
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                      ✕
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extra / Líder / Egg */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> {extraTitle} ({extraDeck.length})
              </h3>
              {extraDeck.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExtraDeck([])}
                  className="text-[10px] text-slate-500 hover:text-red-400 font-semibold"
                >
                  Limpiar
                </button>
              )}
            </div>

            {extraDeck.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-slate-800/80 rounded-lg text-slate-600 text-xs">
                Sin cartas en {extraTitle.toLowerCase()}
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {extraDeck.map((card, i) => (
                  <div
                    key={`${card.id}-${i}`}
                    onClick={() => removeCard(i, "extra")}
                    onMouseEnter={() => setSelectedCard(card)}
                    className="aspect-[3/4] bg-slate-900 rounded overflow-hidden border border-slate-700 hover:border-red-500 cursor-pointer relative group"
                  >
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                      ✕
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Deck (Yu-Gi-Oh only) */}
          {isYugioh && (
            <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" /> SIDE DECK ({sideDeck.length})
                </h3>
                {sideDeck.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSideDeck([])}
                    className="text-[10px] text-slate-500 hover:text-red-400 font-semibold"
                  >
                    Limpiar Side
                  </button>
                )}
              </div>

              {sideDeck.length === 0 ? (
                <div className="py-4 text-center border-2 border-dashed border-slate-800/80 rounded-lg text-slate-600 text-xs">
                  Sin cartas en side deck
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {sideDeck.map((card, i) => (
                    <div
                      key={`${card.id}-${i}`}
                      onClick={() => removeCard(i, "side")}
                      onMouseEnter={() => setSelectedCard(card)}
                      className="aspect-[3/4] bg-slate-900 rounded overflow-hidden border border-slate-700 hover:border-red-500 cursor-pointer relative group"
                    >
                      <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                        ✕
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Search (span 3) */}
        <div className="lg:col-span-3 bg-[#0a0e17] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase">BUSCADOR DE CARTAS</h3>
            <span className="text-[10px] font-bold text-yellow-400 uppercase">{activeTcg?.name}</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar en ${activeTcg?.name || 'TCG'}...`}
                className="w-full bg-slate-900 border border-slate-700 text-white pl-3 pr-8 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              {isSearching ? "Buscando..." : "Buscar Cartas"}
            </button>
          </form>

          <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
            {searchResults.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCard(c)}
                className={`p-2 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
                  selectedCard?.id === c.id
                    ? "bg-slate-800 border-yellow-400/80"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <img src={c.image_url} alt={c.name} className="w-9 h-12 object-cover rounded bg-slate-800 shrink-0" />
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-xs text-white truncate">{c.name}</p>
                  <p className="text-[9px] text-slate-400 truncate">{c.type || c.id}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    title="Agregar a Main Deck"
                    onClick={(e) => { e.stopPropagation(); addCard(c, "main"); }}
                    className="w-6 h-5 rounded bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-300 transition-colors"
                  >
                    M
                  </button>
                  <button
                    type="button"
                    title={`Agregar a ${extraTitle}`}
                    onClick={(e) => { e.stopPropagation(); addCard(c, "extra"); }}
                    className="w-6 h-5 rounded bg-slate-800 hover:bg-blue-500 hover:text-white flex items-center justify-center text-[10px] font-bold text-blue-300 transition-colors"
                  >
                    E
                  </button>
                </div>
              </div>
            ))}

            {searchResults.length === 0 && !isSearching && (
              <p className="text-slate-500 text-xs text-center py-6">No se encontraron cartas para &quot;{searchQuery}&quot;.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
