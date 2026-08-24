"use client";

import { useState } from "react";
import { ShoppingBag, Search, Check, AlertCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export interface ProductItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: string | null;
  status: string;
}

interface PublicStoreClientProps {
  products: ProductItem[];
  whatsappNumber?: string;
}

export function PublicStoreClient({ products, whatsappNumber = "584120000000" }: PublicStoreClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract available unique categories
  const dynamicCategories = ["TODOS", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]];
  const categories = dynamicCategories.length > 1 ? dynamicCategories : ["TODOS", "SLEEVES", "PLAYMATS", "ACCESORIOS", "SINGLES"];

  // Filter products
  const filtered = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "TODOS" ||
      p.category?.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-black px-4 py-2 rounded-xl border transition-all ${
                selectedCategory.toUpperCase() === cat.toUpperCase()
                  ? "bg-yellow-400 text-slate-950 border-yellow-400 shadow-lg shadow-yellow-400/20 scale-105"
                  : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar accesorios o cartas..."
            className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-16 text-center text-slate-500 space-y-3">
          <ShoppingBag className="w-16 h-16 mx-auto opacity-20 text-yellow-400" />
          <h3 className="text-lg font-black text-white">No se encontraron productos</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {products.length === 0
              ? "El catálogo está siendo actualizado. Pronto publicaremos nuevos accesorios y productos."
              : "No hay productos que coincidan con tu búsqueda o categoría seleccionada."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => {
            const isOutOfStock = product.status === "OUT_OF_STOCK" || product.stock <= 0;
            const whatsappMsg = encodeURIComponent(
              `¡Hola Zulia TCG! Me interesa comprar el producto: *${product.name}* (Precio: $${product.price.toFixed(2)}). ¿Aún está disponible?`
            );
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

            return (
              <div
                key={product.id}
                className="bg-[#0a0e17] border border-slate-800 hover:border-yellow-400/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 group shadow-xl hover:-translate-y-1 hover:shadow-2xl"
              >
                <div>
                  {/* Product Image */}
                  <div className="h-52 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-14 h-14 text-slate-700" />
                    )}

                    {product.category && (
                      <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-[9px] font-black text-slate-300 px-2.5 py-1 rounded-md border border-slate-800 uppercase tracking-wider">
                        {product.category}
                      </span>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                          AGOTADO
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <h3 className="font-black text-white text-base group-hover:text-yellow-400 transition-colors line-clamp-1 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                      {product.description || "Accesorio y mercancía oficial para torneos y juego competitivo."}
                    </p>
                  </div>
                </div>

                {/* Pricing and Action */}
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between mb-4 border-t border-slate-800/80 pt-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">PRECIO</span>
                      <span className="text-2xl font-black text-white">${product.price.toFixed(2)}</span>
                    </div>

                    {!isOutOfStock ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        <span>Disponible ({product.stock})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Sin stock</span>
                      </div>
                    )}
                  </div>

                  {!isOutOfStock ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                    >
                      <FaWhatsapp className="w-4 h-4" /> PEDIR POR WHATSAPP
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-500 font-bold py-3 rounded-xl text-xs cursor-not-allowed uppercase tracking-wider"
                    >
                      NO DISPONIBLE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
