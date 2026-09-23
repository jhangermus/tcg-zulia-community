import { supabase } from "./supabase";

/**
 * Sube una imagen (base64 dataURL o File) a Supabase Storage.
 * Retorna la URL pública permanente del archivo.
 *
 * @param dataUrl  - string base64 (data:image/webp;base64,...) o URL externa
 * @param folder   - subcarpeta dentro del bucket "products" (ej: "products", "tournaments", "news")
 * @param filename - nombre base del archivo (sin extensión). Se genera uno automático si no se provee.
 */
export async function uploadToStorage(
  dataUrl: string,
  folder: "products" | "tournaments" | "news",
  filename?: string
): Promise<string> {
  // Si ya es una URL http (no base64), devolverla tal cual
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }

  // Convertir base64 a Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  // Determinar extensión
  const ext = blob.type.includes("webp")
    ? "webp"
    : blob.type.includes("png")
    ? "png"
    : "jpg";

  // Nombre único del archivo
  const name = filename
    ? `${filename}.${ext}`
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const path = `${folder}/${name}`;

  const { error } = await supabase.storage
    .from("products") // bucket name
    .upload(path, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Error subiendo imagen a Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return data.publicUrl;
}
