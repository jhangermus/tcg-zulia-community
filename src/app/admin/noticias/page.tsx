import { prisma } from "@/lib/prisma";
import { AdminNewsManager } from "@/components/admin/AdminNewsManager";

export const dynamic = "force-dynamic";

export default async function AdminNoticiasPage() {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return <AdminNewsManager initialNews={news} />;
}
