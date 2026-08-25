import { prisma } from "@/lib/prisma";
import { PublicRankingClient } from "@/components/ranking/PublicRankingClient";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const [decklists, tcgs] = await Promise.all([
    prisma.decklist.findMany({
      include: {
        tcg: { select: { id: true, name: true, slug: true } },
        tournament: { select: { id: true, name: true, date: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tcg.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#04070d] min-h-screen bg-tactical-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            RANKING <span className="text-yellow-400">COMPETITIVO</span>
          </h1>
          <p className="text-slate-300 text-sm font-medium mt-1">
            Tabla oficial de posiciones por juego (Yu-Gi-Oh!, One Piece y Digimon) de la comunidad Zulia TCG.
          </p>
        </div>
      </div>

      <PublicRankingClient decklists={decklists} tcgs={tcgs} />
    </div>
  );
}
