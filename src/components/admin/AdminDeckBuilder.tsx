"use client";

import { useState, useEffect, useRef } from "react";
import {
  PenTool, Search, Plus, Trash2, Save,
  Layers, Sparkles, RefreshCw, Check, Shield, Gamepad2, MessageSquare, Star, Edit3, X, Upload, Image as ImageIcon
} from "lucide-react";
import { createDecklist, updateDecklist, deleteDecklist } from "@/lib/actions";

interface Card {
  id: string | number;
  name: string;
  type?: string;
  image_url: string;
  slot?: "main" | "extra" | "side" | "leader" | "egg";
}

export interface ExistingDeckItem {
  id: string;
  playerName: string;
  deckName: string | null;
  placement: number;
  tournamentId: string;
  tcgId: string;
  adminNotes?: string | null;
  coverImageUrl?: string | null;
  deckData: string;
  tournament: { name: string };
  tcg: { name: string; slug: string };
}

interface AdminDeckBuilderProps {
  tournaments: Array<{ id: string; name: string; tcgId: string }>;
  tcgs: Array<{ id: string; name: string; slug: string }>;
  existingDecklists?: ExistingDeckItem[];
  initialTournamentId?: string;
  initialTcgId?: string;
}

export function AdminDeckBuilder({
  tournaments,
  tcgs,
  existingDecklists = [],
  initialTournamentId,
  initialTcgId,
}: AdminDeckBuilderProps) {
  // Safe default TCG fallback
  const defaultTcg =
    (initialTcgId && tcgs.find((t) => t.id === initialTcgId)) ||
    tcgs.find((t) => t.slug === "yugioh") ||
    tcgs[0] ||
    { id: "ygo", name: "Yu-Gi-Oh!", slug: "yugioh" };

  const [selectedTcgId, setSelectedTcgId] = useState(defaultTcg.id);

  // Active TCG info
  const activeTcg = tcgs.find((t) => t.id === selectedTcgId) || defaultTcg;
  const tcgSlug = activeTcg?.slug || activeTcg?.name?.toLowerCase() || "yugioh";

  const isOnePiece = tcgSlug.includes("one") || tcgSlug.includes("piece") || tcgSlug.includes("op");
  const isDigimon = tcgSlug.includes("digi");
  const isYugioh = !isOnePiece && !isDigimon;

  // Filter tournaments for selected TCG
  const relevantTournaments = tournaments.filter((t) => t.tcgId === selectedTcgId);
  const fallbackTournament =
    (initialTournamentId && tournaments.find((t) => t.id === initialTournamentId)) ||
    relevantTournaments[0] ||
    tournaments[0] ||
    { id: "", name: "Sin Torneo Asignado", tcgId: selectedTcgId };

  const [selectedTournamentId, setSelectedTournamentId] = useState(fallbackTournament.id);

  // Form states
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [deckName, setDeckName] = useState("");
  const [placement, setPlacement] = useState(1);
  const [adminNotes, setAdminNotes] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  // Deck zones
  const [mainDeck, setMainDeck] = useState<Card[]>([]);
  const [extraDeck, setExtraDeck] = useState<Card[]>([]);
  const [sideDeck, setSideDeck] = useState<Card[]>([]);

  // Search & Preview
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cover image upload from PC ref
  const coverInputRef = useRef<HTMLInputElement>(null);
  const builderTopRef = useRef<HTMLDivElement>(null);

  const extraTitle = isOnePiece ? "LÍDER" : isDigimon ? "DIGI-EGG DECK" : "EXTRA DECK";
  const extraBtn = isOnePiece ? "+ Líder" : isDigimon ? "+ Egg" : "+ Extra";

  // When TCG changes, update selected tournament if needed
  useEffect(() => {
    if (!editingDeckId) {
      if (relevantTournaments.length > 0) {
        if (!relevantTournaments.some((t) => t.id === selectedTournamentId)) {
          setSelectedTournamentId(relevantTournaments[0].id);
        }
      } else if (tournaments.length > 0) {
        setSelectedTournamentId(tournaments[0].id);
      }
    }
  }, [selectedTcgId]);

  // Perform search
  const performSearch = async (query: string, currentSlug: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/cards?tcg=${encodeURIComponent(currentSlug)}&q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.cards && Array.isArray(data.cards)) {
        setSearchResults(data.cards);
        if (data.cards[0] && !selectedCard) {
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
      "one-piece": "Luffy",
      digimon: "Greymon",
    };
    const key = isOnePiece ? "one-piece" : isDigimon ? "digimon" : "yugioh";
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

    // Auto-set cover image if none chosen yet
    if (!coverImageUrl && card.image_url) {
      setCoverImageUrl(card.image_url);
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

  // PC Upload Cover Image
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen de portada debe pesar menos de 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Load Deck into Editor
  const handleStartEditing = (deck: ExistingDeckItem) => {
    setEditingDeckId(deck.id);
    setSelectedTcgId(deck.tcgId);
    setSelectedTournamentId(deck.tournamentId);
    setPlayerName(deck.playerName);
    setDeckName(deck.deckName || "");
    setPlacement(deck.placement);
    setAdminNotes(deck.adminNotes || "");
    setCoverImageUrl(deck.coverImageUrl || null);

    try {
      const parsed = JSON.parse(deck.deckData);
      setMainDeck(parsed.main || []);
      setExtraDeck(parsed.extra || []);
      setSideDeck(parsed.side || []);
    } catch (e) {
      console.error("Error parsing deckData for edit:", e);
    }

    builderTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEditing = () => {
    setEditingDeckId(null);
    setPlayerName("");
    setDeckName("");
    setPlacement(1);
    setAdminNotes("");
    setCoverImageUrl(null);
    setMainDeck([]);
    setExtraDeck([]);
    setSideDeck([]);
  };

  // Submit to Server Action (Create or Update)
  const handleSaveDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !deckName || !selectedTournamentId || !selectedTcgId) {
      alert("Por favor completa los datos del torneo, jugador y nombre del mazo.");
      return;
    }

    if (mainDeck.length === 0) {
      alert("Debes agregar al menos una carta al mazo antes de guardar.");
      return;
    }

    // Default cover image to first card in main or extra if still empty
    const finalCoverImage = coverImageUrl || mainDeck[0]?.image_url || extraDeck[0]?.image_url || "";

    setIsSaving(true);
    try {
      const formData = new FormData();
      if (editingDeckId) {
        formData.append("id", editingDeckId);
      }
      formData.append("playerName", playerName);
      formData.append("deckName", deckName);
      formData.append("placement", placement.toString());
      formData.append("tournamentId", selectedTournamentId);
      formData.append("tcgId", selectedTcgId);
      if (adminNotes.trim()) {
        formData.append("adminNotes", adminNotes.trim());
      }
      if (finalCoverImage) {
        formData.append("coverImageUrl", finalCoverImage);
      }
      formData.append(
        "deckData",
        JSON.stringify({
          main: mainDeck.map((c) => ({ id: c.id, name: c.name, image_url: c.image_url })),
          extra: extraDeck.map((c) => ({ id: c.id, name: c.name, image_url: c.image_url })),
          side: sideDeck.map((c) => ({ id: c.id, name: c.name, image_url: c.image_url })),
        })
      );

      if (editingDeckId) {
        await updateDecklist(formData);
      } else {
        await createDecklist(formData);
      }

      setSavedSuccess(true);
      handleCancelEditing();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving deck:", err);
      alert("Ocurrió un error al guardar el decklist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={builderTopRef} className="space-y-6">
      {/* TCG SELECTOR TABS */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-4 shadow-xl">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-yellow-400" /> SELECCIONA EL JUEGO / TCG:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tcgs.map((tcg) => {
            const isSelected = tcg.id === selectedTcgId;
            const isOP = tcg.slug.includes("one") || tcg.slug.includes("piece") || tcg.slug.includes("op");
            const isDigi = tcg.slug.includes("digi");
            const isYgo = !isOP && !isDigi;

            const activeStyle = isYgo
              ? "bg-red-500/20 border-red-500 text-red-400 shadow-red-500/20"
              : isOP
              ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-purple-500/20"
              : "bg-blue-500/20 border-blue-500 text-blue-400 shadow-blue-500/20";

            return (
              <button
                key={tcg.id}
                type="button"
                onClick={() => {
                  setSelectedTcgId(tcg.id);
                }}
                className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 font-black text-sm transition-all shadow-md ${
                  isSelected
                    ? `${activeStyle} shadow-lg scale-[1.02]`
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${isSelected ? (isYgo ? "bg-red-500" : isOP ? "bg-purple-500" : "bg-blue-500") : "bg-slate-700"}`}></span>
                {tcg.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Form: Tournament, Player, Cover Image Details */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl relative">
        {editingDeckId && (
          <div className="mb-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-black text-yellow-400 flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> EDITANDO DECK EXISTENTE ({deckName || playerName})
            </span>
            <button
              type="button"
              onClick={handleCancelEditing}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancelar Edición
            </button>
          </div>
        )}

        <h2 className="font-black text-white text-lg mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-yellow-400" />
          {editingDeckId ? "Modificar Top Deck" : "Cargar Top Deck al Torneo"} ({activeTcg.name})
        </h2>

        <form onSubmit={handleSaveDeck} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tournament */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                TORNEO AL QUE PERTENECE *
              </label>
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-bold"
              >
                {relevantTournaments.length > 0 ? (
                  relevantTournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                ) : (
                  tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Position / Top */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                POSICIÓN DEL TOP *
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-bold"
              >
                <option value={1}>🥇 1er Lugar (Campeón)</option>
                <option value={2}>🥈 Finalista (2do Lugar)</option>
                <option value={3}>🥉 Top 4 (3er Lugar)</option>
                <option value={4}>🥉 Top 4 (4to Lugar)</option>
                <option value={8}>🎖️ Top 8</option>
              </select>
            </div>

            {/* Player Pilot */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                JUGADOR (PILOTO) *
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ej: Jhanger U."
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Deck Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                NOMBRE DEL DECK *
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder={isOnePiece ? "Ej: Red/Purple Luffy" : isDigimon ? "Ej: Blue Flare Greymon" : "Ej: Snake-Eye Fiendsmith"}
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Cover Image / Ace Monster Selector */}
            <div className="md:col-span-2 lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {coverImageUrl ? (
                      <img src={coverImageUrl} alt="Portada" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-white flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> IMAGEN DE PORTADA / CARTA AS (MINIATURA EN RANKING Y TOPS)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      {coverImageUrl
                        ? "Portada establecida. Esta imagen aparecerá en los recuadros de Top Decks y como avatar del ranking."
                        : "Selecciona una carta del buscador y haz clic en 'Poner como Portada' o súbela desde tu PC."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-yellow-400" /> Subir de PC
                  </button>
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(null)}
                      className="text-xs text-slate-500 hover:text-red-400 p-2"
                      title="Quitar portada"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Admin Commentary / Review (Optional) */}
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-yellow-400" /> COMENTARIOS / ANÁLISIS DEL ADMIN (OPCIONAL)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Escribe algún análisis, cartas destacadas, desempeño del jugador en las rondas o notas sobre el torneo..."
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 resize-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
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
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-3 rounded-lg text-xs transition-colors tracking-widest disabled:opacity-50 shadow-lg shadow-yellow-400/20"
            >
              {savedSuccess ? (
                <Check className="w-4 h-4 text-green-900" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savedSuccess
                ? editingDeckId ? "¡DECK ACTUALIZADO!" : "¡TOP DECK PUBLICADO!"
                : isSaving
                ? "GUARDANDO..."
                : editingDeckId ? "ACTUALIZAR TOP DECK" : "PUBLICAR TOP DECK"}
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
              <div className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center relative">
                {selectedCard.image_url ? (
                  <img src={selectedCard.image_url} alt={selectedCard.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-slate-600 text-xs">Sin imagen</span>
                )}
                {coverImageUrl === selectedCard.image_url && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
                    PORTADA
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{selectedCard.name}</h4>
                <p className="text-[10px] text-yellow-400 font-bold mt-0.5">{selectedCard.type}</p>
                <p className="text-[9px] text-slate-500">ID: {selectedCard.id}</p>
              </div>

              {/* Set as Cover Button */}
              <button
                type="button"
                onClick={() => setCoverImageUrl(selectedCard.image_url)}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-yellow-400 border border-yellow-400/30 text-xs font-black py-2 rounded-lg transition-colors"
              >
                <Star className="w-3.5 h-3.5" /> Poner como Portada
              </button>

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
                    {coverImageUrl === card.image_url && (
                      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-yellow-400 ring-2 ring-slate-900"></div>
                    )}
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

      {/* List of Existing Saved Decks with Edit & Delete Buttons */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-yellow-400" /> Tops & Decks Registrados ({existingDecklists.length})
          </h2>
        </div>

        {existingDecklists.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold text-sm">
            No hay decklists registradas todavía. Usa el constructor de arriba para registrar el primer mazo campeón.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {existingDecklists.map((deck) => (
              <div key={deck.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                {/* Cover Image Thumbnail or Placement */}
                <div className="w-12 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 relative">
                  {deck.coverImageUrl ? (
                    <img src={deck.coverImageUrl} alt={deck.deckName || "Deck"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-yellow-400 font-black text-xs">#{deck.placement}</span>
                  )}
                  <div className="absolute top-0 right-0 bg-yellow-400 text-slate-950 font-black text-[9px] px-1 rounded-bl">
                    #{deck.placement}
                  </div>
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {deck.tcg.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{deck.tournament.name}</span>
                  </div>
                  <p className="font-black text-white text-sm">{deck.deckName}</p>
                  <p className="text-xs text-slate-400 font-medium">Piloto: {deck.playerName}</p>
                  {deck.adminNotes && (
                    <p className="text-[11px] text-yellow-400/80 font-medium mt-1 flex items-center gap-1 line-clamp-1">
                      <MessageSquare className="w-3 h-3 shrink-0" /> {deck.adminNotes}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEditing(deck)}
                    className="flex items-center gap-1.5 bg-yellow-400/10 hover:bg-yellow-400 text-yellow-400 hover:text-slate-950 border border-yellow-400/30 px-3 py-2 rounded-lg text-xs font-black transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>

                  <form
                    action={async () => {
                      await deleteDecklist(deck.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                      title="Eliminar Deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
