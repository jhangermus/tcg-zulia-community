import { prisma } from "@/lib/prisma";
import { PublicCommunityClient, PublicStoreItem, PublicGroupItem } from "@/components/community/PublicCommunityClient";

export const dynamic = "force-dynamic";

export default async function ComunidadPage() {
  const [stores, groups, siteConfigs] = await Promise.all([
    prisma.localStore.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.communityGroup.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.siteConfig.findMany(),
  ]);

  // Convert siteConfigs to dictionary
  const socials: Record<string, string> = {
    instagram_url: "https://instagram.com/zulia_tcg",
    tiktok_url: "https://tiktok.com/@zulia_tcg",
    discord_url: "https://discord.gg/zulia-tcg",
    youtube_url: "https://youtube.com/@zulia_tcg",
    whatsapp_group_url: "https://chat.whatsapp.com/sample",
  };

  for (const c of siteConfigs) {
    socials[c.key] = c.value;
  }

  const mappedStores: PublicStoreItem[] = stores.map((s) => ({
    id: s.id,
    name: s.name,
    location: s.location,
    description: s.description,
    phone: s.phone,
    instagramUrl: s.instagramUrl,
    schedule: s.schedule,
    logoUrl: s.logoUrl,
  }));

  const mappedGroups: PublicGroupItem[] = groups.map((g) => ({
    id: g.id,
    name: g.name,
    tcgName: g.tcgName,
    inviteUrl: g.inviteUrl,
    description: g.description,
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black italic tracking-tighter text-white">
          COMUNIDAD <span className="text-yellow-400">TCG ZULIA</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Encuentra tiendas y sedes oficiales para jugar en Maracaibo, y únete a los grupos de WhatsApp de cada comunidad de cartas.
        </p>
      </div>

      {/* Interactive Public Community Client */}
      <PublicCommunityClient
        stores={mappedStores}
        groups={mappedGroups}
        socials={socials}
      />
    </div>
  );
}
