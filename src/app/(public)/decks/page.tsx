import { prisma } from "@/lib/prisma";
import { PublicDecksClient, DecklistItem } from "@/components/decks/PublicDecksClient";
import { formatSpanishDate } from "@/lib/dateUtils";

// ISR: revalidate every 5 minutes instead of fetching on every request.
// This stops Googlebot/crawlers from draining Neon bandwidth on every hit.
export const revalidate = 300;

export default async function DecksPage() {
  let tcgs: any[] = [];
  let dbDecklists: any[] = [];

  try {
    [tcgs, dbDecklists] = await Promise.all([
      prisma.tcg.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
      prisma.decklist.findMany({
        where: { isRecommended: false },
        select: {
          id: true,
          playerName: true,
          deckName: true,
          placement: true,
          coverImageUrl: true,
          adminNotes: true,
          createdAt: true,
          tournament: { select: { id: true, name: true, date: true } },
          tcg: { select: { id: true, name: true, slug: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);
  } catch (err) {
    console.error("[Decks] DB unavailable:", err);
  }

  // Sort decks primarily by tournament date (most recent tournament first), then by placement (1st, 2nd, 3rd...)
  const sortedDecklists = [...dbDecklists].sort((a, b) => {
    const timeA = a.tournament?.date ? new Date(a.tournament.date).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.tournament?.date ? new Date(b.tournament.date).getTime() : new Date(b.createdAt).getTime();
    if (timeB !== timeA) {
      return timeB - timeA; // Torneo más reciente primero
    }
    return (a.placement || 99) - (b.placement || 99); // 1er lugar, 2do lugar...
  });

  // Format real DB decklists — deckData is loaded lazily per-deck via API
  const decks: DecklistItem[] = sortedDecklists.map((d) => ({
    id: d.id,
    playerName: d.playerName,
    deckName: d.deckName || "Deck de Torneo",
    placement: d.placement,
    tournamentName: d.tournament?.name || "Torneo Oficial",
    tournamentDate: d.tournament?.date ? formatSpanishDate(d.tournament.date) : formatSpanishDate(d.createdAt),
    tcgName: d.tcg.name,
    tcgSlug: d.tcg.slug,
    tcgColor: d.tcg.color,
    adminNotes: d.adminNotes,
    createdAt: formatSpanishDate(d.createdAt),
    // deckData omitted here — client will fetch lazily from /api/decks/[id] on modal open
    deckData: { main: [], extra: [], side: [] },
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            TOP <span className="text-yellow-400">DECKS & METAGAME</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Explora las listas de cartas oficiales y perfiles de mazos campeones de los torneos del Zulia.
          </p>
        </div>
      </div>

      {/* Interactive Decks & Detail Modal */}
      <PublicDecksClient
        decks={decks}
        tcgs={tcgs.map((t) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color }))}
      />
    </div>
  );
}
