"use client";

import { useState } from "react";
import { ShoppingBag, Search, ExternalLink, Check, ShieldCheck } from "lucide-react";
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

const CATEGORIES = [
  { id: "ALL", label: "TODOS" },
  { id: "SLEEVES", label: "PROTECTORES / SLEEVES" },
  { id: "PLAYMATS", label: "TAPETES / PLAYMATS" },
  { id: "DECK_BOXES", label: "DECK BOXES" },
  { id: "SINGLES", label: "CARTAS SUELTAS" },
  { id: "ACCESORIOS", label: "ACCESORIOS" },
];

export function PublicStoreClient({
  products,
  whatsappNumber = "584120000000",
}: PublicStoreClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = products.filter((p) => {
    const matchCategory =
      selectedCategory === "ALL" ||
      (p.category && p.category.toUpperCase() === selectedCategory);
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  return (
    <div className="space-y-8">
      {/* Category Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-black px-4 py-2 transition-all clip-chamfer-tr ${
                selectedCategory === cat.id
                  ? "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/20"
                  : "bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat.label}
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
            className="w-full bg-[#070b14] border border-slate-800 text-white pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-yellow-400 transition-colors clip-chamfer-tr"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#070b14] border border-slate-800 p-16 text-center text-slate-500 space-y-3 clip-chamfer-tr">
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
                className="bg-[#070b14] border border-slate-800 hover:border-yellow-400/50 overflow-hidden flex flex-col justify-between transition-all duration-200 group shadow-xl hover:-translate-y-1 hover:shadow-2xl clip-chamfer-tr relative"
              >
                <div>
                  {/* Product Image */}
                  <div className="h-52 bg-[#0c1220] relative overflow-hidden flex items-center justify-center">
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
                      <span className="absolute top-2 left-2 bg-slate-950/90 text-[9px] font-black text-slate-300 px-2.5 py-0.5 border border-slate-800 uppercase tracking-wider clip-tag-angled">
                        {product.category}
                      </span>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-black text-xs px-4 py-1.5 uppercase tracking-wider shadow-lg clip-tag-chevron">
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

                {/* Price & Action */}
                <div className="p-5 pt-0">
                  <div className="flex items-baseline justify-between mb-3 border-t border-slate-800/80 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-black block uppercase tracking-wider">PRECIO</span>
                      <span className="text-2xl font-black text-white">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 border clip-tag-angled ${
                      isOutOfStock
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}>
                      {isOutOfStock ? "Agotado" : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  <a
                    href={isOutOfStock ? "#" : whatsappUrl}
                    target={isOutOfStock ? undefined : "_blank"}
                    rel={isOutOfStock ? undefined : "noopener noreferrer"}
                    onClick={(e) => {
                      if (isOutOfStock) e.preventDefault();
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3 text-xs font-black tracking-wider transition-all clip-btn-tactical ${
                      isOutOfStock
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
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
      )}
    </div>
  );
}
