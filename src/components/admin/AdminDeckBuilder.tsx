"use client";

import { useState, useEffect, useRef } from "react";
import {
  PenTool, Search, Plus, Trash2, Save,
  Layers, Sparkles, RefreshCw, Check, Shield, Gamepad2, MessageSquare, Star, Edit3, X, Upload, Image as ImageIcon, Award, ZoomIn
} from "lucide-react";
import { createDecklist, updateDecklist, deleteDecklist } from "@/lib/actions";
import { CardZoomModal } from "@/components/decks/CardZoomModal";

interface Card {
  id: string | number;
  name: string;
  type?: string;
  frameType?: string;
  category?: string;
  card_type?: string;
  image_url: string;
  slot?: "main" | "extra" | "side" | "leader" | "egg";
}

export interface ExistingDeckItem {
  id: string;
  playerName: string;
  deckName: string | null;
  placement: number;
  isRecommended?: boolean;
  tournamentId?: string | null;
  tcgId: string;
  adminNotes?: string | null;
  coverImageUrl?: string | null;
  deckData: string;
  tournament?: { name: string } | null;
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

  const relevantTournaments = tournaments.filter((t) => t.tcgId === selectedTcgId);
  const fallbackTournament =
    relevantTournaments[0] ||
    tournaments[0] ||
    { id: "", name: "Sin Torneo Asignado", tcgId: selectedTcgId };

  const [selectedTournamentId, setSelectedTournamentId] = useState(fallbackTournament.id);

  // Form states
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [isRecommended, setIsRecommended] = useState(false);
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
  const [zoomedCard, setZoomedCard] = useState<Card | null>(null);

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

  // Helper function to automatically group identical cards and order by logical TCG category
  const sortAndGroupCards = (cards: Card[], slug: string): Card[] => {
    return [...cards].sort((a, b) => {
      if (a.name === b.name) return 0;

      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aType = (a.type || a.frameType || a.category || a.card_type || "").toLowerCase();
      const bType = (b.type || b.frameType || b.category || b.card_type || "").toLowerCase();

      // Yu-Gi-Oh!
      if (slug.includes("yug") || slug.includes("ygo")) {
        const getPriority = (t: string) => {
          if (t.includes("monster") || t.includes("normal") || t.includes("effect") || t.includes("ritual")) return 1;
          if (t.includes("spell") || t.includes("magia")) return 2;
          if (t.includes("trap") || t.includes("trampa")) return 3;
          if (t.includes("fusion") || t.includes("synchro") || t.includes("xyz") || t.includes("link")) return 4;
          return 5;
        };
        const pA = getPriority(aType);
        const pB = getPriority(bType);
        if (pA !== pB) return pA - pB;
        return aName.localeCompare(bName);
      }

      // One Piece
      if (slug.includes("one") || slug.includes("piece") || slug.includes("op")) {
        const getPriority = (t: string) => {
          if (t.includes("leader") || t.includes("líder")) return 1;
          if (t.includes("character") || t.includes("personaje")) return 2;
          if (t.includes("event") || t.includes("evento")) return 3;
          if (t.includes("stage") || t.includes("escenario")) return 4;
          return 5;
        };
        const pA = getPriority(aType);
        const pB = getPriority(bType);
        if (pA !== pB) return pA - pB;
        return aName.localeCompare(bName);
      }

      // Digimon
      if (slug.includes("digi")) {
        const getPriority = (t: string) => {
          if (t.includes("egg") || t.includes("huevo")) return 1;
          if (t.includes("digimon")) return 2;
          if (t.includes("tamer")) return 3;
          if (t.includes("option")) return 4;
          return 5;
        };
        const pA = getPriority(aType);
        const pB = getPriority(bType);
        if (pA !== pB) return pA - pB;
        return aName.localeCompare(bName);
      }

      // Fallback: group by type then name
      if (aType !== bType) return aType.localeCompare(bType);
      return aName.localeCompare(bName);
    });
  };

  // Helper to detect if a card belongs to the Extra Deck (YGO Fusion/Synchro/XYZ/Link, Digimon Egg/Tama, One Piece Leader)
  const isExtraDeckCard = (card: Card, slug: string): boolean => {
    if (card.slot === "extra" || card.slot === "leader" || card.slot === "egg") {
      return true;
    }

    const typeLower = (card.type || card.frameType || card.category || card.card_type || "").toLowerCase();
    const nameLower = (card.name || "").toLowerCase().trim();
    const idStr = String(card.id || "");

    // Yu-Gi-Oh! Extra Deck types
    if (slug.includes("yug") || slug.includes("ygo")) {
      return (
        typeLower.includes("fusion") ||
        typeLower.includes("synchro") ||
        typeLower.includes("xyz") ||
        typeLower.includes("link")
      );
    }

    // Digimon Digi-Egg / Tama
    if (slug.includes("digi")) {
      const DIGI_EGGS_NAMES = [
        "tsumemon", "koromon", "gigimon", "tanemon", "tokomon", "demiveemon", "upamon", "poromon",
        "mochimon", "motimon", "nyaromon", "pagumon", "yokomon", "pyocomon", "bukamon", "minomon",
        "yaamon", "hopmon", "caprimon", "chibimon", "gummymon", "chocomon", "kokomon", "pickmon",
        "dorimon", "kyokyomon", "wanyamon", "cupimon", "pinamon", "puroromon", "torikaraballmon",
        "bebydomon", "kyaromon", "frimon", "viximon", "sakuttomon", "kakkinmon", "sunamon", "goromon",
        "bibimon", "bosamon", "bowmon", "chapmon", "dokimon", "leafmon", "zurumon", "botamon",
        "punimon", "poyomon", "pabumon", "jyarimon", "cocomon", "popomon", "pipimon", "ketomon",
        "fufumon", "bubbmon", "puwamon", "dodomon", "kuramon", "pafumon", "puttimon", "pichimon",
        "petitmon", "yukimibotamon", "zerimon", "conomon", "kiimon", "bombmon", "tsunomon",
        "gurimon", "yarimon", "monimon", "kodokugumon"
      ];
      return (
        typeLower.includes("egg") ||
        typeLower.includes("huevo") ||
        typeLower.includes("tama") ||
        typeLower.includes("in-training") ||
        DIGI_EGGS_NAMES.some((n) => nameLower === n || nameLower.startsWith(`${n} `)) ||
        /^[A-Z0-9]+-(00[1-6])$/i.test(idStr)
      );
    }

    // One Piece Leader
    if (slug.includes("one") || slug.includes("piece") || slug.includes("op")) {
      return typeLower.includes("leader") || typeLower.includes("líder");
    }

    return false;
  };

  const addCard = (card: Card, target: "main" | "extra" | "side" = "main") => {
    // If targeted to Side Deck explicitly, put in Side Deck
    if (target === "side") {
      setSideDeck((prev) => sortAndGroupCards([...prev, card], tcgSlug));
      return;
    }

    // If card is naturally an Extra Deck / Digi-Egg / Leader, ALWAYS place into Extra Deck
    if (isExtraDeckCard(card, tcgSlug) || target === "extra") {
      setExtraDeck((prev) => sortAndGroupCards([...prev, card], tcgSlug));
      return;
    }

    // Otherwise standard Main Deck
    setMainDeck((prev) => sortAndGroupCards([...prev, card], tcgSlug));
  };

  const removeCard = (index: number, target: "main" | "extra" | "side") => {
    if (target === "extra") {
      setExtraDeck((prev) => prev.filter((_, i) => i !== index));
    } else if (target === "side") {
      setSideDeck((prev) => prev.filter((_, i) => i !== index));
    } else {
      setMainDeck((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle local cover image file upload
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

  // Load a deck to edit
  const handleStartEditing = (deck: ExistingDeckItem) => {
    setEditingDeckId(deck.id);
    setSelectedTcgId(deck.tcgId);
    setSelectedTournamentId(deck.tournamentId || "");
    setIsRecommended(!!deck.isRecommended);
    setPlayerName(deck.playerName);
    setDeckName(deck.deckName || "");
    setPlacement(deck.placement || (deck.isRecommended ? 0 : 1));
    setAdminNotes(deck.adminNotes || "");
    setCoverImageUrl(deck.coverImageUrl || null);

    try {
      const parsed = JSON.parse(deck.deckData);
      const rawMain: Card[] = parsed.main || [];
      const rawExtra: Card[] = parsed.extra || [];
      const rawSide: Card[] = parsed.side || [];

      // Auto-reallocate any Extra/Egg/Leader cards that might have been saved in Main
      const activeTcgSlug = deck.tcg?.slug || tcgSlug;
      const cleanMain: Card[] = [];
      const cleanExtra: Card[] = [...rawExtra];

      for (const c of rawMain) {
        if (isExtraDeckCard(c, activeTcgSlug)) {
          cleanExtra.push(c);
        } else {
          cleanMain.push(c);
        }
      }

      setMainDeck(sortAndGroupCards(cleanMain, activeTcgSlug));
      setExtraDeck(sortAndGroupCards(cleanExtra, activeTcgSlug));
      setSideDeck(sortAndGroupCards(rawSide, activeTcgSlug));
    } catch (e) {
      console.error("Error parsing deckData for edit:", e);
    }

    builderTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEditing = () => {
    setEditingDeckId(null);
    setIsRecommended(false);
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
    if (!playerName || !deckName || !selectedTcgId) {
      alert("Por favor completa el autor/jugador y el nombre del mazo.");
      return;
    }

    if (!isRecommended && !selectedTournamentId) {
      alert("Para un Top de Torneo debes seleccionar el torneo correspondiente.");
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
      formData.append("placement", isRecommended ? "0" : placement.toString());
      formData.append("isRecommended", isRecommended ? "true" : "false");
      if (selectedTournamentId) {
        formData.append("tournamentId", selectedTournamentId);
      }
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
      setTimeout(() => {
        setSavedSuccess(false);
        if (!editingDeckId) {
          setPlayerName("");
          setDeckName("");
          setAdminNotes("");
          setCoverImageUrl(null);
          setMainDeck([]);
          setExtraDeck([]);
          setSideDeck([]);
        } else {
          handleCancelEditing();
        }
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Error saving decklist:", err);
      alert("Error al guardar la decklist.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDeck = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el deck "${name}"?`)) {
      await deleteDecklist(id);
      window.location.reload();
    }
  };

  return (
    <div ref={builderTopRef} className="space-y-8">
      {/* TCG Selector Buttons */}
      <div className="flex flex-wrap gap-2">
        {tcgs.map((tcg) => (
          <button
            key={tcg.id}
            type="button"
            onClick={() => {
              setSelectedTcgId(tcg.id);
              if (editingDeckId) handleCancelEditing();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all ${
              selectedTcgId === tcg.id
                ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                : "bg-[#0a0e17] border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            {tcg.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Builder Form Box */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 relative">
        {editingDeckId && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 text-[10px] font-black px-2.5 py-1 rounded">
              MODO EDICIÓN
            </span>
            <button
              onClick={handleCancelEditing}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        )}

        <h2 className="font-black text-white text-lg mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-yellow-400" />
          {editingDeckId ? "Modificar Deck" : "Cargar Decklist"} ({activeTcg.name})
        </h2>

        <form onSubmit={handleSaveDeck} className="space-y-4">
          {/* Deck Type Selector: Top vs Recommended */}
          <div className="bg-slate-900/80 border border-slate-700 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <div>
                <span className="text-xs font-black text-white block">TIPO DE PUBLICACIÓN</span>
                <span className="text-[11px] text-slate-400">
                  {isRecommended
                    ? "Decklist recomendada / guía para la comunidad (se muestra en /recomendadas)"
                    : "Top oficial de torneo (suma puntos al ranking competitivo)"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRecommended(false)}
                className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                  !isRecommended
                    ? "bg-yellow-400 text-slate-950 shadow"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                🏆 TOP DE TORNEO
              </button>
              <button
                type="button"
                onClick={() => setIsRecommended(true)}
                className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                  isRecommended
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                ⭐ RECOMENDADA / GUÍA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tournament (only for Top Decks) */}
            {!isRecommended && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                  TORNEO AL QUE PERTENECE *
                </label>
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  required={!isRecommended}
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
            )}

            {/* Position / Top (only for Top Decks) */}
            {!isRecommended && (
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
            )}

            {/* Player Pilot / Author */}
            <div className={isRecommended ? "md:col-span-2" : ""}>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
                {isRecommended ? "AUTOR / CREADOR DE LA GUÍA *" : "JUGADOR (PILOTO) *"}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ej: Jhanger U. / Staff Zulia"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Deck Name */}
            <div className={isRecommended ? "md:col-span-2" : ""}>
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
                        : "Haz clic en una carta y pulsa 'Poner como Portada', o sube una imagen personalizada desde tu PC."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border border-slate-700 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-yellow-400" /> Subir Portada de PC
                  </button>
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(null)}
                      className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
                    >
                      Quitar
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

            {/* Admin Notes */}
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-yellow-400" /> NOTAS / ANÁLISIS DEL MAZO (OPCIONAL)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="Escribe algún análisis, cartas destacadas, match-ups favorables o notas sobre el deck..."
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
                ? editingDeckId ? "¡DECK ACTUALIZADO!" : "¡DECKLIST PUBLICADA!"
                : isSaving
                ? "GUARDANDO..."
                : editingDeckId ? "ACTUALIZAR DECK" : isRecommended ? "PUBLICAR DECK RECOMENDADO" : "PUBLICAR TOP DECK"}
            </button>
          </div>
        </form>
      </div>

      {/* 3-Col Studio Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Card Preview (span 3) - Fixed on Click */}
        <div className="lg:col-span-3 bg-[#0a0e17] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase">VISTA PREVIA DE CARTA</h3>
            <span className="text-[10px] text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded">FIJA</span>
          </div>

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
                    className="col-span-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold text-xs py-2 rounded transition-colors border border-purple-500/30"
                  >
                    + Side Deck
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-[3/4] bg-slate-900/40 rounded-lg border border-dashed border-slate-800 flex items-center justify-center text-center p-4">
              <span className="text-slate-500 text-xs font-medium">
                Haz clic en una carta de la lista de búsqueda para ver detalles y agregarla al mazo
              </span>
            </div>
          )}
        </div>

        {/* Deck Grid View (span 6) - NO HOVER OVERWRITE */}
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedCard(card);
                    }}
                    title={`${card.name} (Clic para quitar)`}
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedCard(card);
                    }}
                    title={`${card.name} (Clic para quitar)`}
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
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedCard(card);
                      }}
                      title={`${card.name} (Clic para quitar)`}
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
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                  selectedCard?.id === c.id
                    ? "bg-yellow-400/10 border-yellow-400"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="w-8 h-11 bg-slate-950 rounded overflow-hidden flex-shrink-0">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-bold text-white truncate">{c.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{c.type}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(c);
                    addCard(c, "main");
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-[10px] px-2 py-1 rounded shrink-0"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Existing Decks List */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="font-black text-white text-lg">Decklists Publicadas ({existingDecklists.length})</h2>
            <p className="text-xs text-slate-400">Gestiona, edita o elimina los decks cargados.</p>
          </div>
        </div>

        {existingDecklists.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Gamepad2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="font-bold">No hay decklists cargadas aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {existingDecklists.map((d) => {
              const placementLabel =
                d.isRecommended
                  ? "⭐ RECOMENDADA"
                  : d.placement === 1
                  ? "🥇 1ER LUGAR"
                  : d.placement === 2
                  ? "🥈 FINALISTA"
                  : d.placement <= 4
                  ? `🥉 TOP ${d.placement}`
                  : `🎖️ TOP ${d.placement}`;

              return (
                <div
                  key={d.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-16 bg-slate-900 border border-slate-700 rounded overflow-hidden flex items-center justify-center shrink-0">
                      {d.coverImageUrl ? (
                        <img src={d.coverImageUrl} alt={d.deckName || "Deck"} className="w-full h-full object-cover" />
                      ) : (
                        <Layers className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          d.isRecommended
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                            : d.placement === 1
                            ? "bg-yellow-400 text-slate-950"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {placementLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {d.tcg.name}
                        </span>
                      </div>
                      <h3 className="font-black text-white text-sm truncate">{d.deckName || "Deck Sin Nombre"}</h3>
                      <p className="text-xs text-slate-400">
                        {d.isRecommended ? `Autor: ${d.playerName}` : `Piloto: ${d.playerName} • Torneo: ${d.tournament?.name || "Sin Asignar"}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditing(d)}
                      className="p-2 bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-300 rounded-lg transition-colors"
                      title="Editar Deck"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDeck(d.id, d.deckName || "Deck")}
                      className="p-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                      title="Eliminar Deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Zoom Modal */}
      <CardZoomModal card={zoomedCard} onClose={() => setZoomedCard(null)} />
    </div>
  );
}
