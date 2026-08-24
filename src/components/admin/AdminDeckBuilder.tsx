"use client";

import { useState } from "react";
import {
  PenTool, Search, Plus, Trash2, Save,
  Layers, Sparkles, RefreshCw, Check
} from "lucide-react";
import { createDecklist } from "@/lib/actions";

interface Card {
  id: string | number;
  name: string;
  type?: string;
  desc?: string;
  atk?: number;
  def?: number;
  level?: number;
  image_url: string;
  card_type?: "main" | "extra" | "side" | "leader" | "egg";
}

interface AdminDeckBuilderProps {
  tournaments: Array<{ id: string; name: string; tcgId: string }>;
  tcgs: Array<{ id: string; name: string; slug: string }>;
}

const INITIAL_YGO_CARDS: Card[] = [
  { id: 14558127, name: "Ash Blossom & Joyous Spring", type: "Effect Monster", desc: "Hand trap negation", atk: 0, def: 1800, level: 3, image_url: "https://images.ygoprodeck.com/images/cards/14558127.jpg", card_type: "main" },
  { id: 24224830, name: "Called by the Grave", type: "Quick-Play Spell", desc: "Banish target monster in GY", image_url: "https://images.ygoprodeck.com/images/cards/24224830.jpg", card_type: "main" },
  { id: 10045474, name: "Infinite Impermanence", type: "Normal Trap", desc: "Target 1 monster and negate", image_url: "https://images.ygoprodeck.com/images/cards/10045474.jpg", card_type: "main" },
  { id: 60643553, name: "S:P Little Knight", type: "Link Monster", desc: "2 Effect Monsters", atk: 1600, image_url: "https://images.ygoprodeck.com/images/cards/60643553.jpg", card_type: "extra" },
];

export function AdminDeckBuilder({ tournaments, tcgs }: AdminDeckBuilderProps) {
  const [selectedTcgId, setSelectedTcgId] = useState(tcgs[0]?.id || "");
  const [selectedTournamentId, setSelectedTournamentId] = useState(tournaments[0]?.id || "");
  const [playerName, setPlayerName] = useState("");
  const [deckName, setDeckName] = useState("");
  const [placement, setPlacement] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Card[]>(INITIAL_YGO_CARDS);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(INITIAL_YGO_CARDS[0]);

  const [mainDeck, setMainDeck] = useState<Card[]>([INITIAL_YGO_CARDS[0], INITIAL_YGO_CARDS[1]]);
  const [extraDeck, setExtraDeck] = useState<Card[]>([INITIAL_YGO_CARDS[3]]);
  const [sideDeck, setSideDeck] = useState<Card[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Search card via API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(searchQuery)}&num=15&offset=0`);
      const data = await res.json();
      if (data.data) {
        const formatted: Card[] = data.data.map((c: any) => {
          const isExtra = c.type?.includes("Fusion") || c.type?.includes("Synchro") || c.type?.includes("XYZ") || c.type?.includes("Link");
          return {
            id: c.id,
            name: c.name,
            type: c.type,
            desc: c.desc,
            atk: c.atk,
            def: c.def,
            level: c.level,
            image_url: c.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${c.id}.jpg`,
            card_type: isExtra ? "extra" : "main",
          };
        });
        setSearchResults(formatted);
        if (formatted[0]) setSelectedCard(formatted[0]);
      }
    } catch (err) {
      console.error("Error searching cards:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const addCard = (card: Card, target: "main" | "extra" | "side" = "main") => {
    if (target === "extra" || card.card_type === "extra") {
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

    setIsSaving(true);
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
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
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
              placeholder="Ej: Snake-Eye Fiendsmith"
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

          <div className="lg:col-span-5 flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400">
              Cartas en mazo: <span className="text-white font-extrabold">{mainDeck.length} Main</span> • <span className="text-blue-400 font-extrabold">{extraDeck.length} Extra</span>
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-6 py-2.5 rounded-lg text-xs transition-colors tracking-widest"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-green-800" /> : <Save className="w-4 h-4" />}
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
              <div className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                <img src={selectedCard.image_url} alt={selectedCard.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-sm text-white">{selectedCard.name}</h4>
              <p className="text-[10px] text-yellow-400 font-bold">{selectedCard.type}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => addCard(selectedCard, "main")}
                  className="bg-yellow-400 text-slate-950 font-bold text-xs py-1.5 rounded"
                >
                  + Main
                </button>
                <button
                  type="button"
                  onClick={() => addCard(selectedCard, "extra")}
                  className="bg-blue-600 text-white font-bold text-xs py-1.5 rounded"
                >
                  + Extra
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Selecciona una carta.</p>
          )}
        </div>

        {/* Deck Grid (span 6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-black text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-yellow-400" /> MAIN DECK ({mainDeck.length})
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
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
          </div>

          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-black text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> EXTRA / LÍDER ({extraDeck.length})
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
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
          </div>
        </div>

        {/* Card Search (span 3) */}
        <div className="lg:col-span-3 bg-[#0a0e17] border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase">BUSCADOR API</h3>
          <form onSubmit={handleSearch} className="space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar carta..."
              className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-1.5 rounded flex items-center justify-center gap-1"
            >
              {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {searchResults.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCard(c)}
                className="p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <img src={c.image_url} alt={c.name} className="w-8 h-11 object-cover rounded" />
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-xs text-white truncate">{c.name}</p>
                  <p className="text-[9px] text-slate-500 truncate">{c.type}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); addCard(c, "main"); }}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
