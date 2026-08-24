import { prisma } from "@/lib/prisma";
import { PublicNewsClient } from "@/components/news/PublicNewsClient";
import { Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#04070d] min-h-screen bg-tactical-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            NOTICIAS, <span className="text-yellow-400">LEAKS & REVEALS</span>
          </h1>
          <p className="text-slate-300 text-sm font-medium mt-1">
            Entérate de las últimas filtraciones, reveals de cartas, banlists oficiales y noticias del metagame para Yu-Gi-Oh!, One Piece y Digimon.
          </p>
        </div>
      </div>

      <PublicNewsClient news={news} />
    </div>
  );
}
