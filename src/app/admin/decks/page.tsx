import { prisma } from "@/lib/prisma";
import { PenTool, Trash2, Trophy, Layers, MessageSquare } from "lucide-react";
import { AdminDeckBuilder } from "@/components/admin/AdminDeckBuilder";
import { deleteDecklist } from "@/lib/actions";

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <PenTool className="text-yellow-400 w-8 h-8" /> Creador y Gestor de Top Decks
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Carga las decklists de los ganadores de cada torneo (1er Lugar, Finalista, Top 4, Top 8) con notas y comentarios oficiales.
        </p>
      </div>

      {/* Interactive Deck Builder Studio */}
      <AdminDeckBuilder
        tournaments={tournaments.map((t) => ({ id: t.id, name: t.name, tcgId: t.tcgId }))}
        tcgs={tcgs.map((tcg) => ({ id: tcg.id, name: tcg.name, slug: tcg.slug }))}
        initialTournamentId={initialTournamentId}
        initialTcgId={initialTcgId}
      />

      {/* List of Existing Saved Decks */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Tops & Decks Registrados ({decklists.length})
          </h2>
        </div>

        {decklists.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold text-sm">
            No hay decklists registradas todavía. Usa el constructor de arriba para registrar el primer mazo campeón.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {decklists.map((deck) => (
              <div key={deck.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-black text-sm shrink-0">
                  #{deck.placement}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {deck.tcg.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{deck.tournament.name}</span>
                  </div>
                  <p className="font-black text-white text-sm">{deck.deckName}</p>
                  <p className="text-xs text-slate-400 font-medium">Piloto: {deck.playerName}</p>
                  {deck.adminNotes && (
                    <p className="text-[11px] text-yellow-400/80 font-medium mt-1 flex items-center gap-1 line-clamp-1">
                      <MessageSquare className="w-3 h-3 shrink-0" /> {deck.adminNotes}
                    </p>
                  )}
                </div>

                {/* Delete */}
                <form
                  action={async () => {
                    "use server";
                    await deleteDecklist(deck.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                    title="Eliminar Deck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
