import { prisma } from "@/lib/prisma";
import { LayoutTemplate, Trophy, Sparkles, Layers } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const MOCK_TOP_DECKS = [
  {
    id: "deck-1",
    playerName: "Jhanger U.",
    deckName: "Snake-Eye Fiendsmith",
    tcg: "Yu-Gi-Oh!",
    placement: 1,
    tournament: "Copa Zulia #08",
    date: "26 MAY 2024",
    mainCardsCount: 40,
    extraCardsCount: 15,
    sideCardsCount: 15,
    color: "from-red-950/60 to-slate-900 border-red-900/50",
    badgeColor: "bg-red-950 text-red-400 border-red-800/40",
    keyCards: ["Snake-Eye Ash", "Diabellstar the Black Witch", "Promethean Princess", "Bonfire"],
  },
  {
    id: "deck-2",
    playerName: "Carlos M.",
    deckName: "Red/Blue Luffy OP-07",
    tcg: "One Piece",
    placement: 1,
    tournament: "Pirate Cup Maracaibo",
    date: "19 MAY 2024",
    mainCardsCount: 50,
    extraCardsCount: 10,
    sideCardsCount: 0,
    color: "from-purple-950/60 to-slate-900 border-purple-900/50",
    badgeColor: "bg-purple-950 text-purple-400 border-purple-800/40",
    keyCards: ["Monkey.D.Luffy (Leader)", "Portgas.D.Ace", "Edward.Newgate", "Radical Beam"],
  },
  {
    id: "deck-3",
    playerName: "Luisdavid",
    deckName: "Tenpai Dragon OTK",
    tcg: "Yu-Gi-Oh!",
    placement: 2,
    tournament: "Copa Zulia #08",
    date: "26 MAY 2024",
    mainCardsCount: 40,
    extraCardsCount: 15,
    sideCardsCount: 15,
    color: "from-red-950/60 to-slate-900 border-red-900/50",
    badgeColor: "bg-red-950 text-red-400 border-red-800/40",
    keyCards: ["Tenpai Dragon Chundra", "Sangen Kaimen", "Trident Dragion", "Heat Wave"],
  },
  {
    id: "deck-4",
    playerName: "Rafael A.",
    deckName: "Blue Flare Xros Heart",
    tcg: "Digimon",
    placement: 3,
    tournament: "Copa Zulia #08",
    date: "26 MAY 2024",
    mainCardsCount: 50,
    extraCardsCount: 5,
    sideCardsCount: 0,
    color: "from-blue-950/60 to-slate-900 border-blue-900/50",
    badgeColor: "bg-blue-950 text-blue-400 border-blue-800/40",
    keyCards: ["MetalGreymon (Xros)", "Kiriha Aonuma", "Deckerdramon", "Blazing Sonic Breath"],
  },
];

export default async function DecksPage() {
  const [tcgs, dbDecklists] = await Promise.all([
    prisma.tcg.findMany({ where: { status: "ACTIVE" } }),
    prisma.decklist.findMany({
      include: { tournament: true, tcg: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Map DB decks into display format
  const mappedDbDecks = dbDecklists.map((d) => {
    let parsedData: any = { main: [], extra: [], side: [] };
    try {
      parsedData = JSON.parse(d.deckData);
    } catch (e) {}

    return {
      id: d.id,
      playerName: d.playerName,
      deckName: d.deckName || "Deck de Torneo",
      tcg: d.tcg.name,
      placement: d.placement,
      tournament: d.tournament.name,
      date: new Date(d.createdAt).toLocaleDateString("es-VE"),
      mainCardsCount: parsedData.main?.length || 0,
      extraCardsCount: parsedData.extra?.length || 0,
      sideCardsCount: parsedData.side?.length || 0,
      color: "from-yellow-950/40 to-slate-900 border-yellow-900/40",
      badgeColor: "bg-yellow-950 text-yellow-400 border-yellow-800/40",
      keyCards: parsedData.main?.slice(0, 4).map((c: any) => c.name) || [],
    };
  });

  const allDecks = [...mappedDbDecks, ...MOCK_TOP_DECKS];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            TOP <span className="text-yellow-400">DECKS & METAGAME</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Explora las listas de cartas y perfiles de mazos campeones de los torneos oficiales del Zulia.
          </p>
        </div>
      </div>

      {/* TCG Filters */}
      <div className="flex flex-wrap gap-2">
        <button className="bg-yellow-400 text-slate-950 font-black text-xs px-4 py-2 rounded-lg transition-colors">
          TODOS
        </button>
        {tcgs.map((tcg) => (
          <button
            key={tcg.id}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            {tcg.name}
          </button>
        ))}
      </div>

      {/* Grid of Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allDecks.map((deck) => (
          <div
            key={deck.id}
            className={`bg-gradient-to-br ${deck.color} bg-[#0a0e17] border rounded-xl p-6 flex flex-col justify-between hover:border-yellow-400/50 transition-all group`}
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${deck.badgeColor}`}>
                  {deck.tcg}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center">
                    {deck.placement}
                  </span>
                  <span className="text-[10px] font-black text-yellow-400">TOP {deck.placement}</span>
                </div>
              </div>

              {/* Title & Player */}
              <h3 className="text-xl font-black text-white group-hover:text-yellow-400 transition-colors mb-1">
                {deck.deckName}
              </h3>
              <p className="text-xs font-bold text-slate-300 mb-4">
                Piloto: <span className="text-white font-extrabold">{deck.playerName}</span> • <span className="text-slate-500">{deck.tournament}</span>
              </p>

              {/* Deck Composition info */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 mb-4">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>Main: <span className="text-white font-extrabold">{deck.mainCardsCount}</span></span>
                  <span>Extra/Líder: <span className="text-white font-extrabold">{deck.extraCardsCount}</span></span>
                  <span>Side: <span className="text-white font-extrabold">{deck.sideCardsCount}</span></span>
                </div>
              </div>

              {/* Key Cards list */}
              {deck.keyCards.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-black text-slate-400 tracking-wider mb-2 uppercase">Cartas Clave</p>
                  <div className="flex flex-wrap gap-1.5">
                    {deck.keyCards.map((card: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-900 text-slate-300 border border-slate-800 px-2 py-1 rounded"
                      >
                        {card}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs font-bold text-slate-400">
              <span>{deck.date}</span>
              <span className="text-yellow-400">Verificado</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
