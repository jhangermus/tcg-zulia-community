import { prisma } from "@/lib/prisma";
import { ShoppingBag, MessageCircle, Search, Sparkles, Check, AlertCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export const dynamic = "force-dynamic";

const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Dragon Shield Matte Dual - Orchid",
    description: "Protectores japoneses de 60 unidades. Fondo negro interior para cero transparencia.",
    price: 12.0,
    stock: 8,
    category: "SLEEVES",
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-2",
    name: "Playmat Oficial Zulia TCG - Rubber Mat",
    description: "Tapete de juego acolchado de 60x35cm con costura reforzada en los bordes.",
    price: 25.0,
    stock: 5,
    category: "PLAYMATS",
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-3",
    name: "Deck Box Ultimate Guard Sidewinder 100+ XenoSkin",
    description: "Caja rígida con cierre magnético para guardar hasta 100 cartas con doble protector.",
    price: 22.0,
    stock: 3,
    category: "ACCESORIOS",
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-4",
    name: "Dados Contadores D6 de Resina (Set de 6)",
    description: "Dados para contabilizar contadores de ataque, vida o niveles en torneos.",
    price: 6.0,
    stock: 12,
    category: "ACCESORIOS",
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-5",
    name: "Sobre Booster Pack OP-07 500 Years in the Future",
    description: "Sobre oficial de expansión japonesa/inglesa de One Piece Card Game.",
    price: 5.5,
    stock: 24,
    category: "SINGLES",
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "prod-6",
    name: "Binder Álbum 9 Bolsillos Vault X Zip",
    description: "Carpeta con cierre perimetral y 360 espacios laterales protegidos contra polvo.",
    price: 28.0,
    stock: 0,
    category: "ACCESORIOS",
    status: "OUT_OF_STOCK",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60",
  },
];

export default async function TiendaPage() {
  const dbProducts = await prisma.product.findMany({
    where: { status: { not: "HIDDEN" } },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;

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

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <FaWhatsapp className="w-6 h-6 text-green-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white">¿Quieres comprar o consultar stock?</p>
            <p className="text-slate-400">Haz clic en cualquier producto para pedirlo directamente por WhatsApp.</p>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {["TODOS", "SLEEVES", "PLAYMATS", "ACCESORIOS", "SINGLES"].map((cat, i) => (
          <button
            key={cat}
            className={`text-xs font-black px-4 py-2 rounded-lg transition-colors ${
              i === 0
                ? "bg-yellow-400 text-slate-950"
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const isOutOfStock = product.status === "OUT_OF_STOCK" || product.stock <= 0;
          const whatsappMsg = encodeURIComponent(
            `¡Hola Zulia TCG! Me interesa comprar el producto: *${product.name}* (Precio: $${product.price}). ¿Aún está disponible?`
          );
          const whatsappUrl = `https://wa.me/584240000000?text=${whatsappMsg}`;

          return (
            <div
              key={product.id}
              className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-yellow-400/40 transition-all group"
            >
              <div>
                {/* Product Image */}
                <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-slate-700" />
                  )}

                  {product.category && (
                    <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {product.category}
                    </span>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-red-500 text-white font-black text-xs px-3 py-1 rounded shadow-lg">
                        AGOTADO
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-yellow-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {product.description || "Accesorio de alta calidad para juegos de cartas coleccionables."}
                  </p>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">PRECIO</span>
                      <span className="text-2xl font-black text-yellow-400">${product.price.toFixed(2)}</span>
                    </div>

                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isOutOfStock ? "text-red-400" : "text-green-400"}`}>
                      {isOutOfStock ? (
                        <>
                          <AlertCircle className="w-3 h-3" /> Sin Stock
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" /> Disponible ({product.stock})
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <a
                  href={isOutOfStock ? "#" : whatsappUrl}
                  target={isOutOfStock ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black tracking-wider transition-all ${
                    isOutOfStock
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-400 text-slate-950 shadow-lg shadow-green-500/10"
                  }`}
                >
                  <FaWhatsapp className="w-4 h-4" />
                  {isOutOfStock ? "NO DISPONIBLE" : "PEDIR POR WHATSAPP"}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
