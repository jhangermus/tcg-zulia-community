import { prisma } from "@/lib/prisma";
import { AdminTournamentManager, AdminTournamentItem } from "@/components/admin/AdminTournamentManager";

export const dynamic = "force-dynamic";

export default async function TorneosPage() {
  const [tournaments, tcgs] = await Promise.all([
    prisma.tournament.findMany({
      orderBy: { date: "desc" },
      include: {
        tcg: { select: { id: true, name: true, slug: true } },
        decklists: { select: { id: true, placement: true, playerName: true } },
      },
    }),
    prisma.tcg.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <AdminTournamentManager tournaments={tournaments as AdminTournamentItem[]} tcgs={tcgs} />;
}
