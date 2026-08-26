import { prisma } from "@/lib/prisma";
import { ShoppingBag, Trash2, Tag, Layers, CheckCircle2, XCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { deleteProduct } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponible", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  OUT_OF_STOCK: { label: "Sin Stock", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  HIDDEN: { label: "Oculto", color: "text-slate-400 bg-slate-700/30 border-slate-600" },
};

export default async function AdminTiendaPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShoppingBag className="text-yellow-400 w-8 h-8" /> Gestor de Tienda y Mercancía
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Publica y administra los protectores, playmats, deck boxes y accesorios disponibles para la comunidad.
        </p>
      </div>

      {/* Interactive Add Product Form with PC Image Upload */}
      <AdminProductForm />

      {/* Catalog List */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-yellow-400" /> Productos Publicados ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="p-16 text-center text-slate-500 font-bold text-sm">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-yellow-400" />
            No hay productos registrados en el catálogo. Usa el formulario de arriba para agregar el primero.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {product.category && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wider">
                        {product.category}
                      </span>
                    )}
                    <span className="text-xs font-black text-yellow-400">${product.price.toFixed(2)}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-medium">Stock: {product.stock} unid.</span>
                    <span className="text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <FaWhatsapp className="w-3 h-3" />
                      {product.whatsappNumber ? `+${product.whatsappNumber}` : "+584124721740 (Predeterminado)"}
                    </span>
                  </div>
                  <p className="font-black text-white text-sm truncate">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-slate-500 truncate">{product.description}</p>
                  )}
                </div>

                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${STATUS_MAP[product.status]?.color || STATUS_MAP.AVAILABLE.color}`}>
                  {STATUS_MAP[product.status]?.label || product.status}
                </span>

                {/* Delete Button */}
                <form
                  action={async () => {
                    "use server";
                    await deleteProduct(product.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                    title="Eliminar producto"
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
