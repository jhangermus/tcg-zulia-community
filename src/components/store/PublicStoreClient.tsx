"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export interface ProductItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  images?: string[];
  category?: string | null;
  status: string;
  whatsappNumber?: string | null;
}

interface PublicStoreClientProps {
  products: ProductItem[];
  whatsappNumber?: string;
}

const CATEGORIES = [
  { id: "ALL", label: "TODOS" },
  { id: "DECKS COMPLETOS", label: "DECKS COMPLETOS" },
  { id: "SLEEVES", label: "PROTECTORES / SLEEVES" },
  { id: "PLAYMATS", label: "TAPETES / PLAYMATS" },
  { id: "DECK_BOXES", label: "DECK BOXES" },
  { id: "SINGLES", label: "CARTAS SUELTAS" },
  { id: "ACCESORIOS", label: "ACCESORIOS" },
];

export function PublicStoreClient({
  products,
  whatsappNumber = "584124721740",
}: PublicStoreClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Carousel state
  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!activeModalProduct) return;

    const images =
      activeModalProduct.images && activeModalProduct.images.length > 0
        ? activeModalProduct.images
        : activeModalProduct.imageUrl
        ? [activeModalProduct.imageUrl]
        : [];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalProduct(null);
      } else if (images.length > 1) {
        if (e.key === "ArrowLeft") {
          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        } else if (e.key === "ArrowRight") {
          setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalProduct]);

  const filtered = products.filter((p) => {
    const matchCategory =
      selectedCategory === "ALL" ||
      (p.category && p.category.toUpperCase() === selectedCategory);
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  const getProductImages = (p: ProductItem): string[] => {
    if (p.images && p.images.length > 0) return p.images;
    if (p.imageUrl) return [p.imageUrl];
    return [];
  };

  const activeImages = activeModalProduct ? getProductImages(activeModalProduct) : [];

  const nextImage = () => {
    if (activeImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev < activeImages.length - 1 ? prev + 1 : 0));
  };

  const prevImage = () => {
    if (activeImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : activeImages.length - 1));
  };

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
            const productImages = getProductImages(product);
            const coverImage = productImages[0] || product.imageUrl;
            const hasMultipleImages = productImages.length > 1;

            const isOutOfStock = product.status === "OUT_OF_STOCK" || product.stock <= 0;
            const targetPhone =
              product.whatsappNumber && product.whatsappNumber.trim()
                ? product.whatsappNumber.trim()
                : whatsappNumber;
            const whatsappMsg = encodeURIComponent(
              `¡Hola Zulia TCG! Me interesa comprar el producto: *${product.name}* (Precio: $${product.price.toFixed(2)}). ¿Aún está disponible?`
            );
            const whatsappUrl = `https://wa.me/${targetPhone}?text=${whatsappMsg}`;

            return (
              <div
                key={product.id}
                onClick={() => {
                  setActiveModalProduct(product);
                  setActiveImageIndex(0);
                }}
                className="bg-[#070b14] border border-slate-800 hover:border-yellow-400/60 overflow-hidden flex flex-col justify-between transition-all duration-200 group shadow-xl hover:-translate-y-1 hover:shadow-2xl clip-chamfer-tr relative cursor-pointer"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="h-56 bg-[#0c1220] relative overflow-hidden flex items-center justify-center group-hover:bg-[#0e1628] transition-colors">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-14 h-14 text-slate-700" />
                    )}

                    {/* Category Badge */}
                    {product.category && (
                      <span className="absolute top-2 left-2 bg-slate-950/90 text-[9px] font-black text-slate-300 px-2.5 py-0.5 border border-slate-800 uppercase tracking-wider clip-tag-angled">
                        {product.category}
                      </span>
                    )}

                    {/* Multi-Photo Carousel Indicator */}
                    {hasMultipleImages && (
                      <span className="absolute top-2 right-2 bg-slate-950/90 text-yellow-400 font-black text-[9px] px-2 py-0.5 border border-yellow-400/40 flex items-center gap-1 clip-tag-angled shadow backdrop-blur-sm">
                        <Layers className="w-3 h-3 text-yellow-400" />
                        {productImages.length} FOTOS
                      </span>
                    )}

                    {/* Click hint overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded shadow-lg uppercase tracking-wider">
                        Ver fotos y detalles
                      </span>
                    </div>

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

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 border clip-tag-angled ${
                        isOutOfStock
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {isOutOfStock ? "Agotado" : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  <a
                    href={isOutOfStock ? "#" : whatsappUrl}
                    target={isOutOfStock ? undefined : "_blank"}
                    rel={isOutOfStock ? undefined : "noopener noreferrer"}
                    onClick={(e) => {
                      e.stopPropagation();
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

      {/* FULL PRODUCT DETAIL & CAROUSEL MODAL */}
      {activeModalProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setActiveModalProduct(null)}
        >
          <div
            className="bg-[#090d16] border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/90 hover:bg-yellow-400 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors border border-slate-700 shadow-lg"
              title="Cerrar modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* LEFT: Photo Carousel Section */}
            <div className="md:w-3/5 bg-slate-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative">
              {/* Main Image Viewport */}
              <div className="relative w-full h-80 sm:h-96 md:h-[460px] flex items-center justify-center bg-black/80 p-4 overflow-hidden select-none">
                {activeImages.length > 0 ? (
                  <img
                    src={activeImages[activeImageIndex]}
                    alt={`${activeModalProduct.name} - Foto ${activeImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-300"
                  />
                ) : (
                  <div className="text-center text-slate-600">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Sin fotos disponibles</p>
                  </div>
                )}

                {/* Counter Pill */}
                {activeImages.length > 1 && (
                  <div className="absolute top-4 left-4 z-10 bg-slate-950/85 text-yellow-400 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-400/30 backdrop-blur-md shadow">
                    FOTO {activeImageIndex + 1} DE {activeImages.length}
                  </div>
                )}

                {/* Left/Right Navigation Arrows */}
                {activeImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-yellow-400 hover:text-slate-950 text-white flex items-center justify-center transition-all shadow-xl border border-slate-700 hover:scale-110"
                      title="Foto anterior (Flecha izquierda)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-yellow-400 hover:text-slate-950 text-white flex items-center justify-center transition-all shadow-xl border border-slate-700 hover:scale-110"
                      title="Siguiente foto (Flecha derecha)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              {activeImages.length > 1 && (
                <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
                  {activeImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === activeImageIndex
                          ? "border-yellow-400 ring-2 ring-yellow-400/40 scale-105"
                          : "border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 text-[8px] font-black px-1 bg-black/80 text-white">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Details & WhatsApp Order */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between bg-[#090d16] overflow-y-auto">
              <div className="space-y-4">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {activeModalProduct.category && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-slate-800 text-yellow-400 border border-slate-700 uppercase tracking-wider">
                      {activeModalProduct.category}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded border ${
                      activeModalProduct.status === "OUT_OF_STOCK" || activeModalProduct.stock <= 0
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {activeModalProduct.status === "OUT_OF_STOCK" || activeModalProduct.stock <= 0
                      ? "Agotado"
                      : `Stock: ${activeModalProduct.stock} unid.`}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-white leading-tight">
                  {activeModalProduct.name}
                </h2>

                {/* Price Display */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-black block uppercase tracking-wider">
                    PRECIO TOTAL
                  </span>
                  <span className="text-3xl font-black text-yellow-400">
                    ${activeModalProduct.price.toFixed(2)}
                  </span>
                </div>

                {/* Description with multi-line support */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    DETALLES Y CONTENIDO
                  </h4>
                  <div className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                    {activeModalProduct.description ||
                      "Artículo oficial verificado para la comunidad competitiva de Zulia TCG."}
                  </div>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-2">
                {(() => {
                  const isOutOfStock =
                    activeModalProduct.status === "OUT_OF_STOCK" || activeModalProduct.stock <= 0;
                  const targetPhone =
                    activeModalProduct.whatsappNumber && activeModalProduct.whatsappNumber.trim()
                      ? activeModalProduct.whatsappNumber.trim()
                      : whatsappNumber;
                  const whatsappMsg = encodeURIComponent(
                    `¡Hola Zulia TCG! Me interesa comprar el producto: *${activeModalProduct.name}* (Precio: $${activeModalProduct.price.toFixed(2)}). ¿Aún está disponible?`
                  );
                  const whatsappUrl = `https://wa.me/${targetPhone}?text=${whatsappMsg}`;

                  return (
                    <a
                      href={isOutOfStock ? "#" : whatsappUrl}
                      target={isOutOfStock ? undefined : "_blank"}
                      rel={isOutOfStock ? undefined : "noopener noreferrer"}
                      onClick={(e) => {
                        if (isOutOfStock) e.preventDefault();
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 text-xs font-black tracking-wider transition-all clip-btn-tactical ${
                        isOutOfStock
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                      }`}
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      {isOutOfStock ? "PRODUCTO AGOTADO" : "PEDIR POR WHATSAPP AHORA"}
                    </a>
                  );
                })()}

                <p className="text-[10px] text-center text-slate-500">
                  Respuesta inmediata de la tienda o vendedor oficial en Maracaibo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
