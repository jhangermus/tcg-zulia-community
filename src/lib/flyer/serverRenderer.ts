import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";

function wrapText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

/** Dibuja el logo vectorial del TCG en alta definición */
function drawTcgLogo(ctx: any, tcgSlug: string, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);

  if (tcgSlug === "one-piece" || tcgSlug.includes("piece")) {
    // ─── ONE PIECE CARD GAME LOGO ───
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Calavera
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-145, -8, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Huesos
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-165, -28);
    ctx.lineTo(-125, 12);
    ctx.moveTo(-125, -28);
    ctx.lineTo(-165, 12);
    ctx.stroke();

    // Sombrero de paja
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.ellipse(-145, -12, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cara
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-145, -6, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-149, -6, 2.5, 0, Math.PI * 2);
    ctx.arc(-141, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Texto ONE PIECE
    ctx.font = "900 46px 'Arial Black', Impact, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.textAlign = "left";
    ctx.strokeText("ONE PIECE", -110, 8);
    ctx.fillText("ONE PIECE", -110, 8);

    // Caja CARD GAME
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fillRect(-70, 22, 190, 22);
    ctx.strokeRect(-70, 22, 190, 22);

    ctx.font = "900 13px 'Arial Black', Impact, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("CARD GAME", 25, 38);
  } else if (tcgSlug === "yugioh" || tcgSlug.includes("yugi")) {
    // ─── YU-GI-OH! LOGO ───
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    const goldGrad = ctx.createLinearGradient(0, -30, 0, 15);
    goldGrad.addColorStop(0, "#fef08a");
    goldGrad.addColorStop(0.5, "#eab308");
    goldGrad.addColorStop(1, "#ca8a04");

    ctx.font = "italic 900 50px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 8;
    ctx.strokeText("Yu-Gi-Oh!", 0, 4);
    ctx.fillStyle = goldGrad;
    ctx.fillText("Yu-Gi-Oh!", 0, 4);

    // TRADING CARD GAME
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.fillRect(-120, 18, 240, 22);
    ctx.strokeRect(-120, 18, 240, 22);

    ctx.font = "900 12px 'Arial Black', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("TRADING CARD GAME", 0, 34);
  } else {
    // ─── DIGIMON CARD GAME LOGO ───
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    const blueGrad = ctx.createLinearGradient(0, -30, 0, 15);
    blueGrad.addColorStop(0, "#93c5fd");
    blueGrad.addColorStop(0.5, "#3b82f6");
    blueGrad.addColorStop(1, "#1d4ed8");

    ctx.font = "italic 900 48px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.strokeText("DIGIMON", 0, 4);
    ctx.fillStyle = blueGrad;
    ctx.fillText("DIGIMON", 0, 4);

    // CARD GAME
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 2;
    ctx.fillRect(-90, 18, 180, 22);
    ctx.strokeRect(-90, 18, 180, 22);

    ctx.font = "900 13px 'Arial Black', Impact, sans-serif";
    ctx.fillStyle = "#facc15";
    ctx.fillText("CARD GAME", 0, 34);
  }

  ctx.restore();
}

export async function generateFlyerBuffer(options: {
  tcgSlug: string;
  title?: string;
  cost?: string;
  venueName?: string;
  venueAddress?: string;
  prizeTitle?: string;
  prizeSubtitle?: string;
  dateMonth?: string;
  dateDay?: string;
  dateTime?: string;
  bgImagePathOrUrl?: string;
  bgBuffer?: Buffer;
  bgZoom?: number;
  bgPosY?: number;
  bgPosX?: number;
}): Promise<Buffer> {
  const W = 1080;
  const H = 1350;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // 1. Fondo Negro
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // 2. Imagen del Personaje / Carta (Detrás del marco)
  if (options.bgBuffer || options.bgImagePathOrUrl) {
    try {
      const bgImg = options.bgBuffer 
        ? await loadImage(options.bgBuffer) 
        : await loadImage(options.bgImagePathOrUrl!);

      const zoom = (options.bgZoom ?? 100) / 100;
      const posY = (options.bgPosY ?? 50) / 100;
      const posX = (options.bgPosX ?? 50) / 100;

      const targetH = H * 0.72;
      const scale = Math.max(W / bgImg.width, targetH / bgImg.height) * zoom;
      const scaledW = bgImg.width * scale;
      const scaledH = bgImg.height * scale;

      const offsetX = (W - scaledW) * posX;
      const offsetY = (targetH - scaledH) * posY;

      ctx.drawImage(bgImg, offsetX, offsetY, scaledW, scaledH);
    } catch (e) {
      console.warn("No se pudo cargar la imagen de fondo:", e);
    }
  }

  // 3. Marco Oficial de Canva con transparencia
  const framePath = path.join(process.cwd(), "public/flyers/template_oracle_transparent.png");
  if (fs.existsSync(framePath)) {
    const frameImg = await loadImage(framePath);
    ctx.drawImage(frameImg, 0, 0, W, H);
  }

  // 4. Logo Oficial del TCG (One Piece / Yu-Gi-Oh / Digimon)
  drawTcgLogo(ctx, options.tcgSlug || "one-piece", W / 2, 600);

  // 5. Título del Torneo (Sobreescribe sobre la barra con fondo si es necesario)
  if (options.title && options.title !== "TORNEO AVANZADO") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(180, 705, 720, 45);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 32px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(options.title.toUpperCase(), W / 2, 738);
  }

  // 6. Texto Caja 1: COSTO DE INSCRIPCIÓN
  ctx.fillStyle = "#ffcc00";
  ctx.font = "900 80px 'Arial Black', Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(options.cost || "$5", 175, 930);

  // 7. Texto Caja 2: LUGAR
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 22px 'Arial Black', Impact, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(options.venueName || "ORACLE GAMING", 335, 825);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 14px 'Arial', sans-serif";
  wrapText(
    ctx,
    `Encuéntranos en: ${options.venueAddress || "Av. Circunvalación 2, Frente a URBE, Local 52 Av. 15P, al lado de Librería Aeropuerto, Maracaibo."}`,
    335,
    855,
    330,
    19
  );

  // 8. Texto Caja 3: PREMIOS
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 22px 'Arial Black', Impact, sans-serif";
  ctx.textAlign = "left";
  wrapText(ctx, options.prizeTitle || "¡REPARTO AL TOP 4!", 725, 825, 290, 26);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 13px 'Arial', sans-serif";
  wrapText(ctx, options.prizeSubtitle || "(PREMIACIÓN PENSADA PARA UN AFORO DE 12 PERSONAS)", 725, 910, 290, 18);

  // 9. Barra de Fecha
  const month = (options.dateMonth || "AGOSTO").toUpperCase();
  const day = options.dateDay || "30";
  const time = (options.dateTime || "11:30 AM").toUpperCase();

  ctx.textAlign = "center";
  ctx.font = "900 32px 'Arial Black', Impact, sans-serif";
  ctx.fillStyle = "#ffffff";
  const mW = ctx.measureText(month).width;

  ctx.font = "900 56px 'Arial Black', Impact, sans-serif";
  const dW = ctx.measureText(day).width;

  ctx.font = "900 32px 'Arial Black', Impact, sans-serif";
  const tW = ctx.measureText(time).width;

  const totalW = mW + dW + tW + 60;
  let sX = (W - totalW) / 2;

  // Mes
  ctx.font = "900 32px 'Arial Black', Impact, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(month, sX, 1145);
  sX += mW + 25;

  // Día (Amarillo Gigante)
  ctx.font = "900 56px 'Arial Black', Impact, sans-serif";
  ctx.fillStyle = "#ffcc00";
  ctx.fillText(day, sX, 1152);
  sX += dW + 25;

  // Hora
  ctx.font = "900 32px 'Arial Black', Impact, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(time, sX, 1145);

  return canvas.toBuffer("image/png");
}
