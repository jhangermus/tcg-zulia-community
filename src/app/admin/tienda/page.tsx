import { prisma } from "@/lib/prisma";
import { ShoppingBag, Plus, Trash2 } from "lucide-react";
import { createProduct } from "@/lib/actions";

export const dynamic = "force-dynamic";
import Image from "next/image";

const CATEGORIES = ["SLEEVES", "PLAYMATS", "SINGLES", "ACCESORIOS", "OTROS"];
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "Disponible", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  OUT_OF_STOCK: { label: "Sin Stock", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  HIDDEN: { label: "Oculto", color: "text-slate-400 bg-slate-700/30 border-slate-600" },
};

export default async function TiendaPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShoppingBag className="text-purple-400 w-8 h-8" /> Tienda
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Administra el catálogo de productos disponibles.</p>
      </div>

      {/* Add Form */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
        <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-400" /> Agregar Producto
        </h2>
        <form action={createProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="md:col-span-2 xl:col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">NOMBRE DEL PRODUCTO *</label>
              <input name="name" required placeholder="Ej: Sleeve Dragon Shield Matte Negro" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">PRECIO ($) *</label>
              <input name="price" type="number" step="0.01" required placeholder="5.00" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">STOCK</label>
              <input name="stock" type="number" defaultValue={0} className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">CATEGORÍA</label>
              <select name="category" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-all">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">ESTADO</label>
              <select name="status" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-all">
                <option value="AVAILABLE">Disponible</option>
                <option value="OUT_OF_STOCK">Sin Stock</option>
                <option value="HIDDEN">Oculto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">URL DE IMAGEN (opcional)</label>
              <input name="imageUrl" placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">DESCRIPCIÓN (opcional)</label>
              <textarea name="description" rows={2} placeholder="Descripción del producto..." className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-purple-400 transition-all resize-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-purple-500 hover:bg-purple-400 text-white font-black px-8 py-2.5 rounded-lg text-sm transition-colors tracking-wider">
              AGREGAR PRODUCTO
            </button>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-black text-white text-lg">Catálogo ({products.length})</h2>
        </div>
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No hay productos en el catálogo.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <p className="font-black text-white text-sm">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-green-400">${product.price.toFixed(2)}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-500 font-medium">Stock: {product.stock}</span>
                    {product.category && <><span className="text-slate-600">•</span><span className="text-xs text-slate-500">{product.category}</span></>}
                  </div>
                </div>

                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${STATUS_MAP[product.status]?.color}`}>
                  {STATUS_MAP[product.status]?.label}
                </span>

                <form action={async () => {
                  "use server";
                  const { deleteProduct } = await import("@/lib/actions");
                  await deleteProduct(product.id);
                }}>
                  <button type="submit" className="text-slate-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10">
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

