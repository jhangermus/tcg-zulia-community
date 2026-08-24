import { prisma } from "@/lib/prisma";
import { PublicStoreClient, ProductItem } from "@/components/store/PublicStoreClient";
import { FaWhatsapp } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const [dbProducts, whatsappConfig] = await Promise.all([
    prisma.product.findMany({
      where: { status: { not: "HIDDEN" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteConfig.findUnique({
      where: { key: "whatsapp_number" },
    }),
  ]);

  const whatsappNumber = whatsappConfig?.value || "584120000000";

  const products: ProductItem[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    category: p.category,
    status: p.status,
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            TIENDA Y <span className="text-yellow-400">MERCANCÍA</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Playmats, micas (sleeves), deck boxes, dados y accesorios para tu juego competitivo en Maracaibo.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-emerald-500/5">
          <FaWhatsapp className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white">¿Quieres comprar o consultar disponibilidad?</p>
            <p className="text-slate-400">Haz clic en cualquier producto para pedirlo directamente por WhatsApp.</p>
          </div>
        </div>
      </div>

      {/* Interactive Store Client */}
      <PublicStoreClient products={products} whatsappNumber={whatsappNumber} />
    </div>
  );
}
