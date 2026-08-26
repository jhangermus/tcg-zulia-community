"use client";

import { useState, useRef } from "react";
import { Plus, Upload, Image as ImageIcon, Check, RefreshCw, X, ShoppingBag, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createProduct } from "@/lib/actions";

const CATEGORIES = ["SLEEVES", "PLAYMATS", "ACCESORIOS", "SINGLES", "CAJAS Y SOBRES", "OTROS"];

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
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload from PC
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 4MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val: string) => {
    setImageUrlInput(val);
    setImagePreview(val.trim() || null);
  };

  const clearImage = () => {
    setImagePreview(null);
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
      if (imagePreview) {
        formData.append("imageUrl", imagePreview);
      }

      await createProduct(formData);
      
      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setStock("5");
      setUseDefaultWhatsapp(true);
      setCustomWhatsapp("");
      clearImage();
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

          {/* Image Upload Section */}
          <div className="md:col-span-2 lg:col-span-3 border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-slate-300 tracking-wider">
                FOTO O IMAGEN DEL PRODUCTO
              </label>
              <div className="flex gap-2">
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                {uploadMode === "file" ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-yellow-400 rounded-xl p-6 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-yellow-400/80" />
                    <p className="text-xs font-bold text-slate-200">
                      Haz clic para seleccionar una foto desde tu PC
                    </p>
                    <p className="text-[10px] text-slate-500">Soporta PNG, JPG, JPEG o WEBP (hasta 4MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://ejemplo.com/foto-producto.jpg"
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Pega una URL directa de la imagen</p>
                  </div>
                )}
              </div>

              {/* Live Preview Box */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-xl border border-slate-800 min-h-[140px] relative">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="max-h-28 w-auto object-contain rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
                      title="Eliminar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-slate-600">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span className="text-[10px] font-semibold">Sin foto seleccionada</span>
                  </div>
                )}
              </div>
            </div>
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
