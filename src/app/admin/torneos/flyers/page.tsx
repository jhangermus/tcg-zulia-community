import { prisma } from "@/lib/prisma";
import { Sparkles, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { FlyerGeneratorClient, TournamentOption } from "@/components/admin/FlyerGeneratorClient";

export const dynamic = "force-dynamic";

export default async function AdminFlyersPage() {
  const dbTournaments = await prisma.tournament.findMany({
    include: { tcg: true },
    orderBy: { date: "desc" },
  });

  const tournaments: TournamentOption[] = dbTournaments.map((t) => ({
    id: t.id,
    name: t.name,
    tcgSlug: t.tcg.slug,
    date: t.date.toISOString(),
    location: t.location,
    prize: t.prize,
    bannerUrl: t.bannerUrl,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
            <Link
              href="/admin/torneos"
              className="hover:text-yellow-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a Torneos
            </Link>
            <span>/</span>
            <span className="text-yellow-400">Generador de Flyers</span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Sparkles className="text-yellow-400 w-8 h-8" /> Generador Automático de Flyers
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Crea pósters y flyers en alta definición (1080×1350 px) para One Piece, Yu-Gi-Oh! y Digimon listos para Instagram y WhatsApp.
          </p>
        </div>

        <Link
          href="/admin/torneos"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors self-start sm:self-auto"
        >
          Gestor de Torneos
        </Link>
      </div>

      {/* Interactive Live Generator */}
      <FlyerGeneratorClient tournaments={tournaments} />
    </div>
  );
}
