import { TCG_LOGOS, VENUE_LOGOS } from "./logos";

export interface FlyerOptions {
  tcgSlug: "one-piece" | "yugioh" | "digimon" | string;
  title: string;
  cost: string;
  venueKey: "oracle" | "zulia" | "custom" | string;
  venueName?: string;
  venueAddress?: string;
  prizeTitle: string;
  prizeSubtitle?: string;
  dateMonth: string;
  dateDay: string;
  dateTime: string;
  bgImageUrl?: string | null;
  bgZoom?: number; // 100 to 250 (default 100)
  bgPosY?: number; // 0 to 100 (default 50)
  bgPosX?: number; // 0 to 100 (default 50)
}

/** Carga una imagen de forma asíncrona */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/** Convierte un string SVG a imagen */
function svgToImage(svgString: string): Promise<HTMLImageElement> {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  return loadImage(url).finally(() => URL.revokeObjectURL(url));
}

/** Dibuja texto con salto de línea automático */
function wrapText(
  ctx: CanvasRenderingContext2D,
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

/** Dibuja un rectángulo con esquinas redondeadas */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Renderiza el flyer completo en un canvas de 1080 x 1350 px */
export async function renderTournamentFlyer(
  canvas: HTMLCanvasElement,
  options: FlyerOptions
): Promise<void> {
  const W = 1080;
  const H = 1350;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. FONDO NEGRO BASE
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // 2. CAPA DE IMAGEN DE FONDO (Arte de Carta / Personaje)
  if (options.bgImageUrl) {
    try {
      const bgImg = await loadImage(options.bgImageUrl);
      const zoom = (options.bgZoom ?? 100) / 100;
      const posY = (options.bgPosY ?? 50) / 100;
      const posX = (options.bgPosX ?? 50) / 100;

      // Calcular dimensiones para cubrir el 65% superior
      const targetH = H * 0.72;
      const scale = Math.max(W / bgImg.width, targetH / bgImg.height) * zoom;
      const scaledW = bgImg.width * scale;
      const scaledH = bgImg.height * scale;

      const offsetX = (W - scaledW) * posX;
      const offsetY = (targetH - scaledH) * posY;

      ctx.save();
      ctx.drawImage(bgImg, offsetX, offsetY, scaledW, scaledH);
      ctx.restore();
    } catch (err) {
      console.warn("No se pudo cargar la imagen de fondo:", err);
    }
  }

  // 3. DEGRADADO Y SOMBRAS PARA FUSIÓN CON NEGRO
  // Viñeta superior suave
  const topGrad = ctx.createLinearGradient(0, 0, 0, 300);
  topGrad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
  topGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 300);

  // Degradado inferior profundo (fusiona el arte con la zona de datos)
  const bottomGrad = ctx.createLinearGradient(0, 350, 0, 680);
  bottomGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  bottomGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.85)");
  bottomGrad.addColorStop(1, "#000000");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, 350, W, 330);

  // Fondo negro sólido para toda la zona inferior de cajas
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 680, W, H - 680);

  // 4. LOGO DEL TCG
  const tcgConfig = TCG_LOGOS[options.tcgSlug] || TCG_LOGOS["one-piece"];
  try {
    const tcgLogoImg = await svgToImage(tcgConfig.svgLogo);
    const logoW = 380;
    const logoH = (logoW / 500) * 120;
    const logoX = (W - logoW) / 2;
    const logoY = 485;
    ctx.drawImage(tcgLogoImg, logoX, logoY, logoW, logoH);
  } catch (e) {
    // Fallback de texto si falla el SVG
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 36px 'Arial Black', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(tcgConfig.name.toUpperCase(), W / 2, 530);
  }

  // 5. TÍTULO DEL TORNEO (Con líneas divisorias)
  const titleY = 625;
  const titleText = (options.title || "TORNEO AVANZADO").toUpperCase();
  ctx.font = "900 34px 'Impact', 'Arial Black', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";

  const titleMetrics = ctx.measureText(titleText);
  const textW = titleMetrics.width;
  const lineMargin = 35;
  const lineW = (W - textW - lineMargin * 4) / 2;

  ctx.fillText(titleText, W / 2, titleY);

  // Líneas divisorias blancas
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Línea izquierda
  ctx.moveTo(lineMargin, titleY - 10);
  ctx.lineTo(lineMargin + lineW, titleY - 10);
  // Línea derecha
  ctx.moveTo(W - lineMargin - lineW, titleY - 10);
  ctx.lineTo(W - lineMargin, titleY - 10);
  ctx.stroke();

  // 6. CAJAS TÁCTICAS DE INFORMACIÓN (3 Columnas con borde dorado)
  const boxesY = 675;
  const boxH = 295;
  const goldColor = "#f59e0b"; // Amarillo dorado
  const borderW = 4;
  const gap = 20;

  const col1W = 260; // Caja 1: Costo
  const col2W = 400; // Caja 2: Lugar
  const col3W = 340; // Caja 3: Premios

  const x1 = (W - (col1W + col2W + col3W + gap * 2)) / 2;
  const x2 = x1 + col1W + gap;
  const x3 = x2 + col2W + gap;

  // ─── CAJA 1: COSTO DE INSCRIPCIÓN ───────────────────────
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = borderW;
  ctx.fillStyle = "#05070c";
  roundRect(ctx, x1, boxesY, col1W, boxH, 14);
  ctx.fill();
  ctx.stroke();

  // Header Caja 1
  ctx.fillStyle = goldColor;
  ctx.font = "900 18px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("COSTO DE", x1 + col1W / 2, boxesY + 38);
  ctx.fillText("INSCRIPCIÓN", x1 + col1W / 2, boxesY + 62);

  // Línea divisoria interna
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1 + 20, boxesY + 80);
  ctx.lineTo(x1 + col1W - 20, boxesY + 80);
  ctx.stroke();

  // Precio Gigante
  ctx.fillStyle = "#facc15";
  ctx.font = "900 78px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(options.cost || "$5", x1 + col1W / 2, boxesY + 195);

  // ─── CAJA 2: LUGAR / SEDE ──────────────────────────────
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = borderW;
  ctx.fillStyle = "#05070c";
  roundRect(ctx, x2, boxesY, col2W, boxH, 14);
  ctx.fill();
  ctx.stroke();

  // Header Caja 2
  ctx.fillStyle = goldColor;
  ctx.font = "900 22px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("📍 LUGAR", x2 + 25, boxesY + 45);

  // Línea divisoria interna
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x2 + 20, boxesY + 65);
  ctx.lineTo(x2 + col2W - 20, boxesY + 65);
  ctx.stroke();

  // Nombre de la Sede
  const venueKey = options.venueKey || "oracle";
  const venuePreset = VENUE_LOGOS[venueKey];
  const venueName = options.venueName || venuePreset?.name || "ORACLE GAMING";
  const venueAddress = options.venueAddress || venuePreset?.address || "Maracaibo, Estado Zulia";

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(venueName, x2 + 25, boxesY + 105);

  // Dirección multilínea
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 14px 'Arial', sans-serif";
  wrapText(ctx, `Encuéntranos en: ${venueAddress}`, x2 + 25, boxesY + 138, col2W - 45, 20);

  // ─── CAJA 3: PREMIOS ───────────────────────────────────
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = borderW;
  ctx.fillStyle = "#05070c";
  roundRect(ctx, x3, boxesY, col3W, boxH, 14);
  ctx.fill();
  ctx.stroke();

  // Header Caja 3
  ctx.fillStyle = goldColor;
  ctx.font = "900 22px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("🏆 PREMIOS", x3 + 25, boxesY + 45);

  // Línea divisoria interna
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x3 + 20, boxesY + 65);
  ctx.lineTo(x3 + col3W - 20, boxesY + 65);
  ctx.stroke();

  // Premio Principal
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "left";
  wrapText(ctx, options.prizeTitle || "¡REPARTO AL TOP 4!", x3 + 25, boxesY + 110, col3W - 45, 28);

  // Subtítulo de Premios
  if (options.prizeSubtitle) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 13px 'Arial', sans-serif";
    wrapText(ctx, options.prizeSubtitle, x3 + 25, boxesY + 180, col3W - 45, 18);
  } else {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 13px 'Arial', sans-serif";
    wrapText(ctx, "(Premiación sujeta a aforo de jugadores)", x3 + 25, boxesY + 180, col3W - 45, 18);
  }

  // 7. BARRA DE FECHA Y HORA
  const dateBarY = 1010;
  const dateBarH = 75;
  const dateBarW = col1W + col2W + col3W + gap * 2;
  const dateBarX = x1;

  ctx.strokeStyle = goldColor;
  ctx.lineWidth = borderW;
  ctx.fillStyle = "#05070c";
  roundRect(ctx, dateBarX, dateBarY, dateBarW, dateBarH, 16);
  ctx.fill();
  ctx.stroke();

  // Textos de Fecha
  ctx.textAlign = "center";
  const month = (options.dateMonth || "AGOSTO").toUpperCase();
  const day = options.dateDay || "30";
  const time = (options.dateTime || "11:30 AM").toUpperCase();

  // Centrado compuesto: MES [DÍA en grande dorado] HORA
  ctx.font = "900 32px 'Impact', 'Arial Black', sans-serif";
  ctx.fillStyle = "#ffffff";
  const monthW = ctx.measureText(month).width;

  ctx.font = "900 52px 'Impact', 'Arial Black', sans-serif";
  const dayW = ctx.measureText(day).width;

  ctx.font = "900 32px 'Impact', 'Arial Black', sans-serif";
  const timeW = ctx.measureText(time).width;

  const totalDateW = monthW + dayW + timeW + 60;
  let startX = dateBarX + (dateBarW - totalDateW) / 2;

  // Dibujar MES
  ctx.font = "900 32px 'Impact', 'Arial Black', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(month, startX, dateBarY + 48);
  startX += monthW + 25;

  // Dibujar DÍA (Dorado y Grande)
  ctx.font = "900 54px 'Impact', 'Arial Black', sans-serif";
  ctx.fillStyle = "#facc15";
  ctx.fillText(day, startX, dateBarY + 54);
  startX += dayW + 25;

  // Dibujar HORA
  ctx.font = "900 32px 'Impact', 'Arial Black', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(time, startX, dateBarY + 48);

  // 8. FOOTER CON ESQUINAS ANGULARES DORADAS Y LOGO DE SEDE
  const footerY = 1140;

  // Esquina angular izquierda
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, H - 70);
  ctx.lineTo(60, H - 70);
  ctx.lineTo(160, H);
  ctx.closePath();
  ctx.fill();

  // Esquina angular derecha
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(W, H);
  ctx.lineTo(W, H - 70);
  ctx.lineTo(W - 60, H - 70);
  ctx.lineTo(W - 160, H);
  ctx.closePath();
  ctx.fill();

  // Logo de la Sede en el centro del Footer
  const venueSvg = venuePreset?.svgLogo || VENUE_LOGOS["oracle"].svgLogo;
  try {
    const venueImg = await svgToImage(venueSvg);
    const vW = 280;
    const vH = (vW / 320) * 80;
    ctx.drawImage(venueImg, (W - vW) / 2, footerY + 30, vW, vH);
  } catch (e) {
    ctx.fillStyle = "#f59e0b";
    ctx.font = "900 30px 'Impact', 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(venueName, W / 2, footerY + 70);
  }
}
