import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";

async function main() {
  const imgPath = path.join(process.cwd(), "public/flyers/template_oracle.png");
  const img = await loadImage(imgPath);
  const W = img.width;
  const H = img.height;
  console.log(`Dimensiones: ${W}x${H}`);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;

  // Analizar la parte superior que tiene el degradado blanco hacia negro
  // La mitad superior (hasta y = 560) tiene blanco donde debe verse la carta.
  // Transformamos la luminancia blanca superior en transparencia (alfa).
  // Si un pixel es blanco puro (255,255,255), alfa = 0 (totalmente transparente para ver la carta).
  // Conforme se oscurece hacia el negro del degradado (y = 350 a 560), el alfa aumenta suavemente hacia 255 (negro opaco).
  // Por debajo de y = 560 (cajas de texto y footer), se mantiene el diseño intacto con sus bordes amarillos y textos.

  const splitY = Math.floor(H * 0.55); // ~563px

  for (let y = 0; y < splitY; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Luminancia aproximada del pixel
      const lum = (r + g + b) / 3;

      // Si es parte del degradado blanco -> negro
      // En blanco (lum = 255) -> alfa = 0 (100% transparente para ver el personaje)
      // En negro (lum = 0) -> alfa = 255 (100% opaco negro para tapar la parte baja)
      const alphaVal = Math.max(0, Math.min(255, 255 - lum));
      data[idx] = 0;     // R negro
      data[idx + 1] = 0; // G negro
      data[idx + 2] = 0; // B negro
      data[idx + 3] = alphaVal; // Alfa según degradado
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const outBuffer = canvas.toBuffer("image/png");
  const outPath = path.join(process.cwd(), "public/flyers/template_oracle_transparent.png");
  fs.writeFileSync(outPath, outBuffer);
  console.log("✅ Plantilla con transparencia procesada guardada en:", outPath);
}

main().catch(console.error);
