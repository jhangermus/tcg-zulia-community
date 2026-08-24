import { prisma } from "@/lib/prisma";
import { Gamepad2, Trophy, Newspaper, ShoppingBag, Users, TrendingUp, Layers, Store } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [tcgs, tournaments, news, products, decklists, stores, groups] = await Promise.all([
    prisma.tcg.count(),
    prisma.tournament.count(),
    prisma.news.count(),
    prisma.product.count(),
    prisma.decklist.count(),
    prisma.localStore.count(),
    prisma.communityGroup.count(),
  ]);
  const upcoming = await prisma.tournament.count({ where: { status: "UPCOMING" } });
  return { tcgs, tournaments, news, products, decklists, stores, groups, upcoming };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Top Decks Registrados", count: stats.decklists, icon: Layers, href: "/admin/decks", color: "text-yellow-400", bg: "from-yellow-400/10" },
    { label: "Torneos Totales", count: stats.tournaments, icon: Trophy, href: "/admin/torneos", color: "text-blue-400", bg: "from-blue-400/10" },
    { label: "Tiendas y Sedes", count: stats.stores, icon: Store, href: "/admin/comunidad", color: "text-emerald-400", bg: "from-emerald-400/10" },
    { label: "Productos en Tienda", count: stats.products, icon: ShoppingBag, href: "/admin/tienda", color: "text-purple-400", bg: "from-purple-400/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard General</h1>
          <p className="text-slate-400 mt-1 font-medium">Bienvenido al panel de control de Zulia TCG.</p>
        </div>
        <Link href="/" target="_blank" className="text-sm font-bold text-slate-400 hover:text-yellow-400 transition-colors border border-slate-700 hover:border-yellow-400/50 px-4 py-2 rounded-lg">
          Ver Sitio Web →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className={`bg-[#0a0e17] border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition-colors bg-gradient-to-br ${card.bg} to-transparent`}>
            <div className="flex items-start justify-between mb-4">
              <card.icon className={`w-7 h-7 ${card.color}`} />
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <div className={`text-4xl font-black ${card.color} mb-1`}>{card.count}</div>
            <div className="text-sm font-bold text-slate-400">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-black text-white mb-4 tracking-wide">ACCIONES RÁPIDAS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <QuickAction href="/admin/decks" icon={Layers} title="Publicar Top Deck" desc="Cargar listas de ganadores de torneos" color="yellow" />
          <QuickAction href="/admin/torneos" icon={Trophy} title="Gestionar Torneos" desc="Crear nuevo evento o torneo oficial" color="blue" />
          <QuickAction href="/admin/comunidad" icon={Users} title="Comunidad y Tiendas" desc="Administrar sedes, WhatsApp y redes" color="green" />
          <QuickAction href="/admin/tienda" icon={ShoppingBag} title="Productos de Tienda" desc="Publicar playmats, sleeves y cartas" color="purple" />
          <QuickAction href="/admin/noticias" icon={Newspaper} title="Publicar Noticia" desc="Publicar noticias en el feed principal" color="pink" />
          <QuickAction href="/admin/tcgs" icon={Gamepad2} title="Configurar Juegos" desc="Yu-Gi-Oh!, One Piece, Digimon" color="yellow" />
        </div>
      </div>

      {/* Upcoming Tournaments Banner */}
      {stats.upcoming > 0 && (
        <div className="bg-gradient-to-r from-blue-900/30 to-transparent border border-blue-800/50 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10 text-blue-400" />
            <div>
              <p className="font-black text-white text-lg">{stats.upcoming} torneo(s) próximo(s)</p>
              <p className="text-slate-400 text-sm font-medium">Revisa los detalles en el gestor de torneos.</p>
            </div>
          </div>
          <Link href="/admin/torneos" className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors">
            Ver Torneos
          </Link>
        </div>
      )}
    </div>
  );
}

type IconComponent = typeof Gamepad2;

function QuickAction({ href, icon: Icon, title, desc, color }: { href: string; icon: IconComponent; title: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:border-yellow-400/40",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20 hover:border-blue-400/40",
    green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:border-emerald-400/40",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20 hover:border-purple-400/40",
    pink: "text-pink-400 bg-pink-400/10 border-pink-400/20 hover:border-pink-400/40",
  };
  return (
    <Link href={href} className={`flex items-center gap-4 p-4 rounded-xl border ${colors[color]} transition-all bg-[#0a0e17]`}>
      <div className={`w-10 h-10 rounded-lg ${colors[color].split(" ")[1]} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${colors[color].split(" ")[0]}`} />
      </div>
      <div>
        <h3 className="font-bold text-white text-sm">{title}</h3>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </Link>
  );
}
