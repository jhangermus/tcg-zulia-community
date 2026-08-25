import { prisma } from "@/lib/prisma";
import { PenTool } from "lucide-react";
import { AdminDeckBuilder, ExistingDeckItem } from "@/components/admin/AdminDeckBuilder";

export const dynamic = "force-dynamic";

const DEFAULT_TCGS = [
  { name: "Yu-Gi-Oh!", slug: "yugioh", status: "ACTIVE", color: "#ef4444" },
  { name: "One Piece", slug: "one-piece", status: "ACTIVE", color: "#8b5cf6" },
  { name: "Digimon", slug: "digimon", status: "ACTIVE", color: "#3b82f6" },
];

export default async function AdminDecksPage({
  searchParams,
}: {
  searchParams?: Promise<{ tournamentId?: string; tcgId?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTournamentId = resolvedParams?.tournamentId;
  const initialTcgId = resolvedParams?.tcgId;

  // Ensure default TCGs exist
  for (const defTcg of DEFAULT_TCGS) {
    await prisma.tcg.upsert({
      where: { slug: defTcg.slug },
      update: { status: "ACTIVE" },
      create: defTcg,
    });
  }

  let [tournaments, tcgs, decklists] = await Promise.all([
    prisma.tournament.findMany({ orderBy: { date: "desc" } }),
    prisma.tcg.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.decklist.findMany({
      orderBy: { createdAt: "desc" },
      include: { tournament: true, tcg: true },
    }),
  ]);

  // Ensure each TCG has at least one default tournament so admin is never blocked
  for (const tcg of tcgs) {
    const hasTournament = tournaments.some((t) => t.tcgId === tcg.id);
    if (!hasTournament) {
      const created = await prisma.tournament.create({
        data: {
          name: `Torneo Zulia - ${tcg.name}`,
          date: new Date(),
          location: "Maracaibo, Zulia",
          status: "COMPLETED",
          tcgId: tcg.id,
          participantsCount: 16,
        },
      });
      tournaments.push(created);
    }
  }

  const mappedDecks: ExistingDeckItem[] = decklists.map((d) => ({
    id: d.id,
    playerName: d.playerName,
    deckName: d.deckName,
    placement: d.placement,
    isRecommended: d.isRecommended,
    tournamentId: d.tournamentId,
    tcgId: d.tcgId,
    adminNotes: d.adminNotes,
    coverImageUrl: d.coverImageUrl,
    deckData: d.deckData,
    tournament: d.tournament ? { name: d.tournament.name } : null,
    tcg: { name: d.tcg.name, slug: d.tcg.slug },
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <PenTool className="text-yellow-400 w-8 h-8" /> Creador y Gestor de Top Decks
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Carga, edita y administra las decklists de los ganadores de cada torneo (1er Lugar, Finalista, Top 4, Top 8) con fotos de portada y comentarios oficiales.
        </p>
      </div>

      {/* Interactive Deck Builder Studio with Edit Support */}
      <AdminDeckBuilder
        tournaments={tournaments.map((t) => ({ id: t.id, name: t.name, tcgId: t.tcgId }))}
        tcgs={tcgs.map((tcg) => ({ id: tcg.id, name: tcg.name, slug: tcg.slug }))}
        existingDecklists={mappedDecks}
        initialTournamentId={initialTournamentId}
        initialTcgId={initialTcgId}
      />
    </div>
  );
}
