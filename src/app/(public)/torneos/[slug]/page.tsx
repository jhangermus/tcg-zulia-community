import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users, Award, Trophy, ArrowLeft } from "lucide-react";
import { formatSpanishDateFull, formatSpanishTime, formatSpanishDate } from "@/lib/dateUtils";
import { ShareButton } from "@/components/torneos/ShareButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t) return { title: "Torneo no encontrado | Zulia TCG" };
  return {
    title: `${t.name} | Zulia TCG`,
    description: `Torneo oficial de ${t.name}. Consulta fecha, horario, sede y tabla de clasificados.`,
  };
}

export default async function TorneoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      tcg: true,
      decklists: {
        orderBy: { placement: "asc" },
        take: 8,
      },
    },
  });

  if (!tournament) return notFound();

  const statusLabel: Record<string, string> = {
    UPCOMING: "PRÓXIMO",
    ONGOING: "EN CURSO",
    COMPLETED: "FINALIZADO",
  };

  const statusColor: Record<string, string> = {
    UPCOMING: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    ONGOING: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    COMPLETED: "text-green-400 border-green-400/30 bg-green-400/10",
  };

  const topDecks = tournament.decklists.filter((d) => d.placement > 0 && d.placement <= 8);
  const placementLabel: Record<number, string> = {
    1: "🥇 1er Lugar",
    2: "🥈 2do Lugar",
    3: "🥉 3er Lugar",
    4: "4to Lugar",
    5: "5to Lugar",
    6: "6to Lugar",
    7: "7mo Lugar",
    8: "8vo Lugar",
  };

  return (
    <div className="min-h-screen bg-[#04070d] bg-tactical-grid">
      {/* Hero Banner Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {tournament.bannerUrl ? (
          <>
            <img
              src={tournament.bannerUrl}
              alt={tournament.name}
              className="w-full h-full object-cover"
              style={{ objectPosition: `center ${tournament.bannerPosition ?? "50"}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04070d] via-[#04070d]/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#001736] via-[#070b14] to-[#04070d]" />
        )}

        {/* Back Link */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <Link
            href="/torneos"
            className="flex items-center gap-2 text-xs font-black text-white bg-black/60 backdrop-blur-md px-3 py-2 rounded border border-white/10 hover:bg-black/80 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER A TORNEOS
          </Link>
        </div>

        {/* TCG & Status Badges */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center gap-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-slate-900/90 text-yellow-400 border border-yellow-400/40 backdrop-blur-md shadow">
            {tournament.tcg.name}
          </span>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 border backdrop-blur-md shadow ${statusColor[tournament.status] ?? "text-slate-300 border-slate-700 bg-slate-800"}`}>
            {statusLabel[tournament.status] ?? tournament.status}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 -mt-16 px-4 md:px-8 pb-12 max-w-4xl mx-auto space-y-6">

        {/* Title Box */}
        <div className="bg-[#070b14] border border-slate-800 p-6 md:p-8 shadow-2xl clip-chamfer-tr hud-box hud-bracket-yellow">
          <h1 className="text-3xl md:text-4xl font-black italic text-white leading-tight drop-shadow-lg mb-2">
            {tournament.name}
          </h1>
          <p className="text-slate-400 text-sm font-semibold">
            {formatSpanishDate(tournament.date)} &nbsp;•&nbsp; {tournament.tcg.name}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#070b14] border border-slate-800 p-5 space-y-3 shadow-lg clip-chamfer-tr">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase">DETALLES DEL EVENTO</h2>
            <div className="space-y-2.5 text-sm font-semibold text-slate-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{formatSpanishDateFull(tournament.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Hora: {formatSpanishTime(tournament.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{tournament.location || "Maracaibo, Zulia"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Cupo: {tournament.participantsCount > 0 ? `${tournament.participantsCount} jugadores` : "Abierto"}
                </span>
              </div>
              {tournament.prize && (
                <div className="flex items-center gap-3 text-yellow-400 font-black">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Premio: {tournament.prize}</span>
                </div>
              )}
            </div>
          </div>

          {/* Share & Actions Box */}
          <div className="bg-[#070b14] border border-slate-800 p-5 flex flex-col justify-between gap-4 shadow-lg clip-chamfer-tr">
            <div>
              <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">COMPARTIR ENLACE</h2>
              <p className="text-xs text-slate-300 mb-3 font-medium">
                Copia y envía este enlace directo por WhatsApp o redes para invitar duelistas a este torneo.
              </p>
              <ShareButton slug={tournament.slug} name={tournament.name} />
            </div>

            {tournament.status !== "COMPLETED" ? (
              <Link
                href="/comunidad"
                className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-3 text-xs transition-colors tracking-widest clip-btn-tactical shadow-lg shadow-yellow-400/20"
              >
                REGISTRARSE AL TORNEO
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-green-900/20 border border-green-800 text-green-400 font-black text-xs py-3 text-center rounded">
                <Trophy className="w-4 h-4" /> TORNEO FINALIZADO
              </div>
            )}
          </div>
        </div>

        {/* Top Results */}
        {topDecks.length > 0 && (
          <div className="bg-[#070b14] border border-slate-800 p-6 shadow-lg clip-chamfer-tr hud-box">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> RESULTADOS DEL TOP
            </h2>
            <div className="space-y-2">
              {topDecks.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-black shrink-0 ${
                      d.placement === 1 ? "bg-yellow-400 text-slate-950" :
                      d.placement === 2 ? "bg-slate-300 text-slate-950" :
                      d.placement === 3 || d.placement === 4 ? "bg-amber-600 text-white" :
                      "bg-slate-700 text-white"
                    }`}>
                      #{d.placement}
                    </span>
                    <div className="min-w-0">
                      <p className="text-white font-black text-sm truncate">{d.playerName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 shrink-0">
                    {placementLabel[d.placement] ?? `Top ${d.placement}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tournament Winner/Podium Photo */}
        {tournament.photoUrl && (
          <div className="bg-[#070b14] border border-slate-800 p-4 shadow-lg clip-chamfer-tr overflow-hidden">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> FOTO DEL PODIO / CAMPEÓN
            </h2>
            <div className="relative rounded overflow-hidden">
              <img
                src={tournament.photoUrl}
                alt={`Foto torneo ${tournament.name}`}
                className="w-full object-cover max-h-[500px]"
              />
              {topDecks[0] && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                  <p className="text-white font-black text-sm [text-shadow:_0_1px_4px_#000]">
                    🥇 Campeón: {topDecks[0].playerName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Link
            href="/torneos"
            className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Ver todos los torneos
          </Link>
        </div>
      </div>
    </div>
  );
}
