"use client";

import { useState, useRef } from "react";
import { Plus, Upload, Image as ImageIcon, Check, RefreshCw, X, ShoppingBag, Phone, Star, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createProduct } from "@/lib/actions";
import { compressImage } from "@/lib/imageCompressor";

const CATEGORIES = ["SLEEVES", "PLAYMATS", "ACCESORIOS", "SINGLES", "CAJAS Y SOBRES", "DECKS COMPLETOS", "OTROS"];

export function AdminProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("5");
  const [category, setCategory] = useState("SLEEVES");
  const [status, setStatus] = useState("AVAILABLE");
  
  // WhatsApp Configuration
  const [useDefaultWhatsapp, setUseDefaultWhatsapp] = useState(true);
  const [customWhatsapp, setCustomWhatsapp] = useState("");
  
  // Multiple images state
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload: compress locally then upload to Supabase Storage (URL stored, not base64)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    try {
      const { uploadToStorage } = await import("@/lib/uploadToStorage");
      const uploadedUrls: string[] = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande (máx 10MB).`);
          continue;
        }
        // 1. Comprimir a WebP max 1200x1200 para reducir tamaño antes de subir
        const compressed = await compressImage(file, 1200, 1200, 0.78);
        // 2. Subir a Supabase Storage → obtener URL pública permanente
        const publicUrl = await uploadToStorage(compressed, "products");
        uploadedUrls.push(publicUrl);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Ocurrió un error al subir una o más imágenes.");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const clearAllImages = () => {
    setImages([]);
    setImageUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      formData.append("status", status);
      if (!useDefaultWhatsapp && customWhatsapp.trim()) {
        formData.append("whatsappNumber", customWhatsapp.trim());
      }
      
      // Pasar todas las imágenes cargadas
      images.forEach((img) => {
        formData.append("images", img);
      });
      if (images[0]) {
        formData.append("imageUrl", images[0]);
      }

      await createProduct(formData);
      
      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setStock("5");
      setUseDefaultWhatsapp(true);
      setCustomWhatsapp("");
      clearAllImages();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Ocurrió un error al guardar el producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="font-black text-white text-lg mb-5 flex items-center gap-2">
        <Plus className="w-5 h-5 text-yellow-400" /> Agregar Producto al Catálogo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
              NOMBRE DEL PRODUCTO *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Dragon Shield Matte Dual - Orchid"
              className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
              CATEGORÍA *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-bold"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
              PRECIO EN DÓLARES ($) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ej: 12.50"
              className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
              CANTIDAD DISPONIBLE (STOCK) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Ej: 10"
              className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
              ESTADO DEL PRODUCTO *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-bold"
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="OUT_OF_STOCK">Sin Stock (Agotado)</option>
              <option value="HIDDEN">Oculto</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">
              DESCRIPCIÓN DEL PRODUCTO
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el producto, medidas, características especiales o condición..."
              className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 resize-none"
            />
          </div>

          {/* WhatsApp Contact Configuration */}
          <div className="md:col-span-2 lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaWhatsapp className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black text-white tracking-wide">
                  CONTACTO DE WHATSAPP PARA LA VENTA
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                {useDefaultWhatsapp ? "Usando número oficial" : "Número personalizado"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={useDefaultWhatsapp}
                  onChange={(e) => {
                    setUseDefaultWhatsapp(e.target.checked);
                    if (e.target.checked) setCustomWhatsapp("");
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                />
                <span>Usar WhatsApp predeterminado de Zulia TCG <strong className="text-emerald-400 font-black">(+58 412-4721740)</strong></span>
              </label>
            </div>

            {!useDefaultWhatsapp && (
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[11px] font-bold text-slate-300 mb-1 tracking-wider">
                  NÚMERO DE WHATSAPP DEL VENDEDOR / CONTACTO *
                </label>
                <div className="relative max-w-md">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={!useDefaultWhatsapp}
                    value={customWhatsapp}
                    onChange={(e) => setCustomWhatsapp(e.target.value)}
                    placeholder="Ej: +584141234567 o 04141234567"
                    className="w-full bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 text-white pl-9 pr-3.5 py-2 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Los clientes que hagan clic en "PEDIR POR WHATSAPP" en este producto se comunicarán directamente a este número.
                </p>
              </div>
            )}
          </div>

          {/* Image Upload Section (Multi-Photo Supported) */}
          <div className="md:col-span-2 lg:col-span-3 border-t border-slate-800/80 pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider">
                  FOTOS DEL PRODUCTO (PUEDES SUBIR VARIAS)
                </label>
                <p className="text-[11px] text-slate-500">
                  Ideal para publicar decks completos o productos con varias vistas o cartas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-colors ${
                    uploadMode === "file"
                      ? "bg-yellow-400 text-slate-950 font-black"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Subir desde PC
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`text-[10px] font-bold px-3 py-1 rounded-md transition-colors ${
                    uploadMode === "url"
                      ? "bg-yellow-400 text-slate-950 font-black"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Pegar Enlace URL
                </button>
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                  >
                    Borrar todas
                  </button>
                )}
              </div>
            </div>

            {/* Upload Selector */}
            {uploadMode === "file" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-yellow-400 rounded-xl p-5 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center gap-2"
              >
                {isCompressing ? (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold py-2 animate-pulse">
                    <RefreshCw className="w-5 h-5 animate-spin" /> Optimizando y comprimiendo fotos...
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-yellow-400/80" />
                    <p className="text-xs font-bold text-slate-200">
                      Haz clic para seleccionar una o varias fotos desde tu PC
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Puedes seleccionar múltiples fotos a la vez (PNG, JPG o WEBP). Se comprimen automáticamente para no saturar la web.
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  placeholder="https://ejemplo.com/foto-deck.jpg"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-4 py-2 rounded-lg text-xs whitespace-nowrap"
                >
                  + Agregar Foto
                </button>
              </div>
            )}

            {/* Multi-Photo Thumbnails Gallery */}
            {images.length > 0 ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {images.length} {images.length === 1 ? "foto cargada" : "fotos cargadas"} (la primera es la portada)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Arrastra o haz clic en "Portada" para elegir cuál se muestra primero
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`group relative aspect-square bg-slate-950 rounded-xl overflow-hidden border transition-all ${
                        idx === 0
                          ? "border-yellow-400 ring-2 ring-yellow-400/30 shadow-lg"
                          : "border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Index Tag */}
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-black/80 text-white backdrop-blur-sm">
                        #{idx + 1}
                      </span>

                      {/* Cover Badge */}
                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-black text-center py-0.5 rounded bg-yellow-400 text-slate-950 shadow">
                          👑 PORTADA
                        </span>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => makeCover(idx)}
                            className="w-full text-[9px] font-black py-1 px-1.5 rounded bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition-colors"
                          >
                            Hacer Portada
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="w-full text-[9px] font-black py-1 px-1.5 rounded bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add more button tile */}
                  <div
                    onClick={() => {
                      if (uploadMode === "file") {
                        fileInputRef.current?.click();
                      }
                    }}
                    className="aspect-square bg-slate-900/60 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-yellow-400 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors p-2 text-center"
                  >
                    <Plus className="w-6 h-6 text-yellow-400 mb-1" />
                    <span className="text-[10px] font-bold">Agregar más fotos</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 text-slate-500 text-xs flex items-center justify-center gap-1.5">
                <ImageIcon className="w-4 h-4 opacity-40" /> Sin fotos cargadas aún (puedes subir una o varias)
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500 font-medium">
            El producto aparecerá inmediatamente en la tienda pública.
          </span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-3 rounded-lg text-xs transition-colors tracking-widest disabled:opacity-50 shadow-lg shadow-yellow-400/20"
          >
            {successMsg ? <Check className="w-4 h-4 text-green-900" /> : isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
            {successMsg ? "¡PRODUCTO GUARDADO!" : isSubmitting ? "GUARDANDO..." : "PUBLICAR EN TIENDA"}
          </button>
        </div>
      </form>
    </div>
  );
}
