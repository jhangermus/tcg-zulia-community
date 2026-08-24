import { prisma } from "@/lib/prisma";
import { Gamepad2, Trophy, Newspaper, ShoppingBag, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [tcgs, tournaments, news, products] = await Promise.all([
    prisma.tcg.count(),
    prisma.tournament.count(),
    prisma.news.count(),
    prisma.product.count(),
  ]);
  const upcoming = await prisma.tournament.count({ where: { status: "UPCOMING" } });
  return { tcgs, tournaments, news, products, upcoming };
}

const statCards = [
  { label: "Juegos Activos", key: "tcgs" as const, icon: Gamepad2, href: "/admin/tcgs", color: "text-yellow-400", bg: "from-yellow-400/10" },
  { label: "Torneos Totales", key: "tournaments" as const, icon: Trophy, href: "/admin/torneos", color: "text-blue-400", bg: "from-blue-400/10" },
  { label: "Noticias", key: "news" as const, icon: Newspaper, href: "/admin/noticias", color: "text-green-400", bg: "from-green-400/10" },
  { label: "Productos en Tienda", key: "products" as const, icon: ShoppingBag, href: "/admin/tienda", color: "text-purple-400", bg: "from-purple-400/10" },
];

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1 font-medium">Bienvenido al panel de control de Zulia TCG.</p>
        </div>
        <Link href="/" target="_blank" className="text-sm font-bold text-slate-400 hover:text-yellow-400 transition-colors border border-slate-700 hover:border-yellow-400/50 px-4 py-2 rounded-lg">
          Ver Sitio →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.key} href={card.href} className={`bg-[#0a0e17] border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition-colors bg-gradient-to-br ${card.bg} to-transparent`}>
            <div className="flex items-start justify-between mb-4">
              <card.icon className={`w-7 h-7 ${card.color}`} />
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <div className={`text-4xl font-black ${card.color} mb-1`}>{stats[card.key]}</div>
            <div className="text-sm font-bold text-slate-400">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-black text-white mb-4 tracking-wide">ACCIONES RÁPIDAS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <QuickAction href="/admin/tcgs" icon={Gamepad2} title="Gestionar TCGs" desc="Agregar, suspender o eliminar juegos" color="yellow" />
          <QuickAction href="/admin/torneos" icon={Trophy} title="Nuevo Torneo" desc="Crear un nuevo evento o torneo" color="blue" />
          <QuickAction href="/admin/noticias" icon={Newspaper} title="Nueva Noticia" desc="Publicar en el feed principal" color="green" />
          <QuickAction href="/admin/tienda" icon={ShoppingBag} title="Nuevo Producto" desc="Agregar producto a la tienda" color="purple" />
          <QuickAction href="/admin/comunidad" icon={Users} title="Comunidad" desc="Gestionar jugadores y redes sociales" color="pink" />
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
    green: "text-green-400 bg-green-400/10 border-green-400/20 hover:border-green-400/40",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20 hover:border-purple-400/40",
    pink: "text-pink-400 bg-pink-400/10 border-pink-400/20 hover:border-pink-400/40",
  };
  return (
    <Link href={href} className={`flex items-center gap-4 p-4 rounded-xl border ${colors[color]} transition-all bg-[#0a0e17]`}>
      <div className={`w-10 h-10 rounded-lg ${colors[color].split(" ")[1]} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${colors[color].split(" ")[0]}`} />
      </div>
      <div>
        <p className="font-bold text-sm text-white">{title}</p>
        <p className="text-xs text-slate-400 font-medium">{desc}</p>
      </div>
    </Link>
  );
}

