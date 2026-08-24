import { prisma } from "@/lib/prisma";
import { PublicDecksClient, DecklistItem } from "@/components/decks/PublicDecksClient";

export const dynamic = "force-dynamic";

export default async function DecksPage() {
  const [tcgs, dbDecklists] = await Promise.all([
    prisma.tcg.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.decklist.findMany({
      include: { tournament: true, tcg: true },
      orderBy: [{ placement: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  // Format real DB decklists
  const decks: DecklistItem[] = dbDecklists.map((d) => {
    let parsedData = { main: [], extra: [], side: [] };
    try {
      if (typeof d.deckData === "string") {
        parsedData = JSON.parse(d.deckData);
      } else {
        parsedData = d.deckData as any;
      }
    } catch (e) {
      console.error("Error parsing deckData for deck", d.id, e);
    }

    return {
      id: d.id,
      playerName: d.playerName,
      deckName: d.deckName || "Deck de Torneo",
      placement: d.placement,
      tournamentName: d.tournament?.name || "Torneo Oficial",
      tournamentDate: d.tournament?.date ? new Date(d.tournament.date).toLocaleDateString("es-VE") : undefined,
      tcgName: d.tcg.name,
      tcgSlug: d.tcg.slug,
      tcgColor: d.tcg.color,
      adminNotes: d.adminNotes,
      createdAt: new Date(d.createdAt).toLocaleDateString("es-VE"),
      deckData: {
        main: parsedData.main || [],
        extra: parsedData.extra || [],
        side: parsedData.side || [],
      },
    };
  });

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
