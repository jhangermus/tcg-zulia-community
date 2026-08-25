import { prisma } from "@/lib/prisma";
import { PlayerProfileClient, PlayerDeckItem } from "@/components/player/PlayerProfileClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = await params;
  const decodedName = decodeURIComponent(resolvedParams.name).trim();

  if (!decodedName) {
    notFound();
  }

  // Fetch all decks belonging to this player (case-insensitive where possible)
  const decks = await prisma.decklist.findMany({
    where: {
      playerName: {
        equals: decodedName,
        mode: "insensitive",
      },
    },
    include: {
      tcg: { select: { id: true, name: true, slug: true } },
      tournament: { select: { id: true, name: true, date: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (decks.length === 0) {
    // Fallback: search if playerName startsWith or contains
    const fallbackDecks = await prisma.decklist.findMany({
      where: {
        playerName: {
          contains: decodedName,
          mode: "insensitive",
        },
      },
      include: {
        tcg: { select: { id: true, name: true, slug: true } },
        tournament: { select: { id: true, name: true, date: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (fallbackDecks.length === 0) {
      notFound();
    }
  }

  const activeDecks = decks.length > 0 ? decks : [];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#04070d] min-h-screen bg-tactical-grid">
      <PlayerProfileClient playerName={decodedName} decks={activeDecks as PlayerDeckItem[]} />
    </div>
  );
}
