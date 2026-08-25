import { prisma } from "@/lib/prisma";
import {
  PublicRecommendedDecksClient,
  RecommendedDeckItem,
} from "@/components/decks/PublicRecommendedDecksClient";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RecomendadasPage() {
  const [decklists, tcgs] = await Promise.all([
    prisma.decklist.findMany({
      where: {
        isRecommended: true,
      },
      include: {
        tcg: { select: { id: true, name: true, slug: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tcg.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, slug: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const mappedDecks: RecommendedDeckItem[] = decklists.map((d) => {
    let parsedData = { main: [], extra: [], side: [] };
    try {
      parsedData = JSON.parse(d.deckData);
    } catch (e) {
      console.error("Error parsing deckData:", e);
    }

    return {
      id: d.id,
      playerName: d.playerName,
      deckName: d.deckName || "Decklist Recomendada",
      tcgName: d.tcg.name,
      tcgSlug: d.tcg.slug,
      tcgColor: d.tcg.color,
      adminNotes: d.adminNotes,
      coverImageUrl: d.coverImageUrl,
      createdAt: d.createdAt.toISOString(),
      deckData: parsedData,
    };
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#04070d] min-h-screen bg-tactical-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            DECKLISTS <span className="text-yellow-400">RECOMENDADAS</span>
          </h1>
          <p className="text-slate-300 text-sm font-medium mt-1">
            Guías estratégicas, listas optimizadas y recomendaciones de la comunidad y jueces del Zulia para cada TCG.
          </p>
        </div>
      </div>

      <PublicRecommendedDecksClient decks={mappedDecks} tcgs={tcgs} />
    </div>
  );
}
