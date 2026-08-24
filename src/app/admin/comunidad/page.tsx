import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { AdminCommunityManager } from "@/components/admin/AdminCommunityManager";

export const dynamic = "force-dynamic";

export default async function AdminComunidadPage() {
  const [stores, groups, siteConfigs] = await Promise.all([
    prisma.localStore.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.communityGroup.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.siteConfig.findMany(),
  ]);

  // Map configs to dictionary
  const socials: Record<string, string> = {};
  for (const c of siteConfigs) {
    socials[c.key] = c.value;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Users className="text-yellow-400 w-8 h-8" /> Gestor de Comunidad y Tiendas
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Administra las tiendas aliadas (con foto/logo desde tu PC), los grupos de WhatsApp por juego y las redes oficiales de Zulia TCG.
        </p>
      </div>

      {/* Interactive Community Manager */}
      <AdminCommunityManager
        stores={stores.map((s) => ({
          id: s.id,
          name: s.name,
          location: s.location,
          description: s.description,
          phone: s.phone,
          instagramUrl: s.instagramUrl,
          schedule: s.schedule,
          logoUrl: s.logoUrl,
        }))}
        groups={groups.map((g) => ({
          id: g.id,
          name: g.name,
          tcgName: g.tcgName,
          inviteUrl: g.inviteUrl,
          description: g.description,
        }))}
        socials={socials}
      />
    </div>
  );
}
