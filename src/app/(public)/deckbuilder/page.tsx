"use client";

import { useState, useEffect } from "react";
import {
  PenTool, Search, Plus, Trash2, Download, Copy,
  Sparkles, Layers, Shield, Zap, RefreshCw, Check
} from "lucide-react";

interface Card {
  id: string | number;
  name: string;
  type?: string;
  desc?: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  image_url: string;
  card_type?: "main" | "extra" | "side" | "leader" | "don" | "egg";
}

// Sample preloaded starter cards for immediate offline testing
const INITIAL_YGO_CARDS: Card[] = [
  { id: 14558127, name: "Ash Blossom & Joyous Spring", type: "Effect Monster", desc: "When a card or effect is activated that includes any of these effects...", atk: 0, def: 1800, level: 3, attribute: "FIRE", image_url: "https://images.ygoprodeck.com/images/cards/14558127.jpg", card_type: "main" },
  { id: 24224830, name: "Called by the Grave", type: "Quick-Play Spell", desc: "Target 1 monster in your opponent's GY; banish it...", image_url: "https://images.ygoprodeck.com/images/cards/24224830.jpg", card_type: "main" },
  { id: 10045474, name: "Infinite Impermanence", type: "Normal Trap", desc: "Target 1 face-up monster your opponent controls; negate its effects...", image_url: "https://images.ygoprodeck.com/images/cards/10045474.jpg", card_type: "main" },
  { id: 60643553, name: "S:P Little Knight", type: "Link Monster", desc: "2 Effect Monsters. If this card is Link Summoned using a Fusion, Synchro, Xyz, or Link Monster as material...", atk: 1600, image_url: "https://images.ygoprodeck.com/images/cards/60643553.jpg", card_type: "extra" },
  { id: 84013237, name: "Promethean Princess, Bestower of Flames", type: "Link Monster", desc: "2+ Effect Monsters including a FIRE monster...", atk: 2700, image_url: "https://images.ygoprodeck.com/images/cards/84013237.jpg", card_type: "extra" },
  { id: 74677422, name: "Red-Eyes Black Dragon", type: "Normal Monster", desc: "A ferocious dragon with a deadly attack.", atk: 2400, def: 2000, level: 7, attribute: "DARK", image_url: "https://images.ygoprodeck.com/images/cards/74677422.jpg", card_type: "main" },
];

const INITIAL_OP_CARDS: Card[] = [
  { id: "OP01-001", name: "Monkey.D.Luffy (Leader)", type: "Leader", desc: "[Activate: Main] [Once Per Turn] Give this Leader or 1 of your Characters up to 1 rested DON!! card.", atk: 5000, image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=60", card_type: "leader" },
  { id: "OP01-004", name: "Roronoa Zoro", type: "Character", desc: "[Rush] (This card can attack on the turn in which it is played.)", atk: 5000, image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=60", card_type: "main" },
  { id: "OP01-016", name: "Nami", type: "Character", desc: "[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card and add it to your hand.", atk: 1000, image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=60", card_type: "main" },
  { id: "OP01-029", name: "Radical Beam!!", type: "Event", desc: "[Counter] Up to 1 of your Leader or Character cards gets +2000 power during this battle. Then, if you have 2 or less Life cards, give that card an additional +2000 power.", image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60", card_type: "main" },
];

const INITIAL_DIGI_CARDS: Card[] = [
  { id: "BT1-001", name: "Koromon", type: "Digi-Egg", desc: "[Your Turn] While this Digimon is level 4 or higher, it gets +1000 DP.", image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=60", card_type: "egg" },
  { id: "BT1-010", name: "Agumon", type: "Digimon", desc: "[On Play] Reveal 5 cards from the top of your deck. Add 1 Tamer card among them to your hand.", atk: 2000, image_url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=60", card_type: "main" },
  { id: "BT1-025", name: "WarGreymon", type: "Digimon", desc: "[When Digivolving] This Digimon gains <Security Attack +1> for the turn.", atk: 11000, image_url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=300&auto=format&fit=crop&q=60", card_type: "main" },
  { id: "BT1-085", name: "Tai Kamiya", type: "Tamer", desc: "[Start of Your Turn] If your Memory is at 2 or less, set it to 3.", image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=60", card_type: "main" },
];

export default function DeckBuilderPage() {
  const [selectedTcg, setSelectedTcg] = useState<"yugioh" | "onepiece" | "digimon">("yugioh");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Card[]>(INITIAL_YGO_CARDS);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(INITIAL_YGO_CARDS[0]);
  const [copied, setCopied] = useState(false);

  // Deck state
  const [mainDeck, setMainDeck] = useState<Card[]>([INITIAL_YGO_CARDS[0], INITIAL_YGO_CARDS[1], INITIAL_YGO_CARDS[2]]);
  const [extraDeck, setExtraDeck] = useState<Card[]>([INITIAL_YGO_CARDS[3], INITIAL_YGO_CARDS[4]]);
  const [sideDeck, setSideDeck] = useState<Card[]>([]);

  // Change initial card pool when TCG tab switches
  useEffect(() => {
    if (selectedTcg === "yugioh") {
      setSearchResults(INITIAL_YGO_CARDS);
      setSelectedCard(INITIAL_YGO_CARDS[0]);
      setMainDeck([INITIAL_YGO_CARDS[0], INITIAL_YGO_CARDS[1], INITIAL_YGO_CARDS[2]]);
      setExtraDeck([INITIAL_YGO_CARDS[3], INITIAL_YGO_CARDS[4]]);
      setSideDeck([]);
    } else if (selectedTcg === "onepiece") {
      setSearchResults(INITIAL_OP_CARDS);
      setSelectedCard(INITIAL_OP_CARDS[0]);
      setMainDeck([INITIAL_OP_CARDS[1], INITIAL_OP_CARDS[2], INITIAL_OP_CARDS[3]]);
      setExtraDeck([INITIAL_OP_CARDS[0]]); // Leader
      setSideDeck([]);
    } else {
      setSearchResults(INITIAL_DIGI_CARDS);
      setSelectedCard(INITIAL_DIGI_CARDS[0]);
      setMainDeck([INITIAL_DIGI_CARDS[1], INITIAL_DIGI_CARDS[2], INITIAL_DIGI_CARDS[3]]);
      setExtraDeck([INITIAL_DIGI_CARDS[0]]); // Egg
      setSideDeck([]);
    }
  }, [selectedTcg]);

  // Live card search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      if (selectedTcg === "yugioh") {
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
              race: c.race,
              attribute: c.attribute,
              image_url: c.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${c.id}.jpg`,
              card_type: isExtra ? "extra" : "main",
            };
          });
          setSearchResults(formatted);
          if (formatted[0]) setSelectedCard(formatted[0]);
        }
      } else {
        // Filter local mock list
        const pool = selectedTcg === "onepiece" ? INITIAL_OP_CARDS : INITIAL_DIGI_CARDS;
        const filtered = pool.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
        setSearchResults(filtered);
      }
    } catch (err) {
      console.error("Error searching cards:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Add Card
  const addCard = (card: Card, target: "main" | "extra" | "side" = "main") => {
    if (target === "extra" || card.card_type === "extra" || card.card_type === "leader" || card.card_type === "egg") {
      setExtraDeck((prev) => [...prev, card]);
    } else if (target === "side") {
      setSideDeck((prev) => [...prev, card]);
    } else {
      setMainDeck((prev) => [...prev, card]);
    }
  };

  // Remove Card
  const removeCard = (index: number, from: "main" | "extra" | "side") => {
    if (from === "main") {
      setMainDeck((prev) => prev.filter((_, i) => i !== index));
    } else if (from === "extra") {
      setExtraDeck((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSideDeck((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Copy Decklist to Clipboard
  const copyDecklist = () => {
    const list = `=== DECKLIST ZULIA TCG (${selectedTcg.toUpperCase()}) ===\n\n-- MAIN DECK (${mainDeck.length}) --\n${mainDeck.map(c => c.name).join("\n")}\n\n-- EXTRA / SPECIAL (${extraDeck.length}) --\n${extraDeck.map(c => c.name).join("\n")}\n\n-- SIDE DECK (${sideDeck.length}) --\n${sideDeck.map(c => c.name).join("\n")}`;
    navigator.clipboard.writeText(list);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#05080f] min-h-screen text-white">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white flex items-center gap-3">
            <PenTool className="text-yellow-400 w-8 h-8" /> DECK <span className="text-yellow-400">BUILDER</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Construye, testea y exporta las listas de tus barajas para torneos oficiales del Zulia.
          </p>
        </div>

        {/* TCG Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          {[
            { key: "yugioh", label: "Yu-Gi-Oh!" },
            { key: "onepiece", label: "One Piece" },
            { key: "digimon", label: "Digimon" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTcg(tab.key as any)}
              className={`text-xs font-black px-4 py-2 rounded-lg transition-all ${
                selectedTcg === tab.key
                  ? "bg-yellow-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Deck Builder Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COL 1: Card Inspector & Details (span 3) */}
        <div className="lg:col-span-3 bg-[#0a0e17] border border-slate-800 rounded-xl p-5 space-y-4 sticky top-20">
          <h2 className="text-xs font-black text-slate-400 tracking-wider uppercase">VISTA PREVIA DE CARTA</h2>

          {selectedCard ? (
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative flex items-center justify-center">
                <img
                  src={selectedCard.image_url}
                  alt={selectedCard.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-black text-lg text-white leading-tight">{selectedCard.name}</h3>
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block mt-1">
                  {selectedCard.type || "Carta de Juego"}
                </span>

                {(selectedCard.atk !== undefined || selectedCard.def !== undefined) && (
                  <div className="flex gap-4 text-xs font-black text-slate-200 mt-2 bg-slate-900/90 p-2 rounded border border-slate-800">
                    {selectedCard.atk !== undefined && <span>ATK / {selectedCard.atk}</span>}
                    {selectedCard.def !== undefined && <span>DEF / {selectedCard.def}</span>}
                    {selectedCard.level !== undefined && <span>★ {selectedCard.level}</span>}
                  </div>
                )}

                <div className="mt-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 max-h-40 overflow-y-auto custom-scrollbar text-[11px] text-slate-300 leading-relaxed">
                  {selectedCard.desc || "Efecto y texto de la carta."}
                </div>
              </div>

              {/* Add Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => addCard(selectedCard, "main")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Main Deck
                </button>
                <button
                  onClick={() => addCard(selectedCard, "extra")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Extra / Líder
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-bold">
              Selecciona una carta para ver sus detalles.
            </div>
          )}
        </div>

        {/* COL 2: Deck Construction Grid (span 6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Deck Action Bar */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-bold">
              <div>
                <span className="text-slate-500 block text-[9px]">MAIN DECK</span>
                <span className={`text-base font-black ${mainDeck.length >= 40 ? "text-green-400" : "text-yellow-400"}`}>
                  {mainDeck.length} {selectedTcg === "yugioh" ? "/ 40-60" : "/ 50"}
                </span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div>
                <span className="text-slate-500 block text-[9px]">{selectedTcg === "yugioh" ? "EXTRA" : selectedTcg === "onepiece" ? "LÍDER" : "DIGITAMA"}</span>
                <span className="text-base font-black text-blue-400">{extraDeck.length}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div>
                <span className="text-slate-500 block text-[9px]">SIDE DECK</span>
                <span className="text-base font-black text-purple-400">{sideDeck.length}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyDecklist}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "¡COPIADO!" : "COPIAR LISTA"}</span>
              </button>
              <button
                onClick={() => { setMainDeck([]); setExtraDeck([]); setSideDeck([]); }}
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                title="Limpiar mazo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN DECK GRID */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-yellow-400" /> MAIN DECK ({mainDeck.length})
              </h2>
              <span className="text-[10px] text-slate-500 font-bold">Haz clic en una carta para eliminar</span>
            </div>

            {mainDeck.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-600 text-xs font-bold">
                Tu Main Deck está vacío. Busca cartas en el panel derecho y agrégalas aquí.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-2">
                {mainDeck.map((card, i) => (
                  <div
                    key={`${card.id}-${i}`}
                    onClick={() => removeCard(i, "main")}
                    onMouseEnter={() => setSelectedCard(card)}
                    className="aspect-[3/4] bg-slate-900 rounded overflow-hidden border border-slate-700 hover:border-red-500 cursor-pointer relative group shadow-md transition-transform hover:scale-105"
                  >
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs">
                      ✕
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EXTRA DECK / LEADER GRID */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> {selectedTcg === "yugioh" ? "EXTRA DECK" : selectedTcg === "onepiece" ? "LÍDER / DON!!" : "DIGITAMA"} ({extraDeck.length})
              </h2>
            </div>

            {extraDeck.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-600 text-xs font-bold">
                Sin cartas especiales agregadas.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-2">
                {extraDeck.map((card, i) => (
                  <div
                    key={`${card.id}-${i}`}
                    onClick={() => removeCard(i, "extra")}
                    onMouseEnter={() => setSelectedCard(card)}
                    className="aspect-[3/4] bg-slate-900 rounded overflow-hidden border border-slate-700 hover:border-red-500 cursor-pointer relative group shadow-md transition-transform hover:scale-105"
                  >
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs">
                      ✕
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COL 3: Card Search & Database Pool (span 3) */}
        <div className="lg:col-span-3 bg-[#0a0e17] border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-black text-slate-400 tracking-wider uppercase">BUSCADOR DE CARTAS</h2>

          <form onSubmit={handleSearch} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={selectedTcg === "yugioh" ? "Buscar en Yu-Gi-Oh!..." : "Buscar carta..."}
                className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 transition-all"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-400" /> : <Search className="w-3.5 h-3.5" />}
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {/* Results List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {searchResults.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`p-2 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                  selectedCard?.id === card.id
                    ? "bg-yellow-400/10 border-yellow-400/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-10 h-14 bg-slate-800 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                  <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-xs text-white truncate">{card.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{card.type}</p>
                  {card.atk !== undefined && (
                    <p className="text-[9px] text-yellow-400 font-bold mt-0.5">ATK: {card.atk}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addCard(card, "main");
                  }}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors flex-shrink-0"
                  title="Agregar al Main"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
