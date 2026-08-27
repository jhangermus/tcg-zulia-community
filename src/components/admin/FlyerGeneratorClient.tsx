"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Upload,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Copy,
  Layers,
  MapPin,
  Trophy,
  DollarSign,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import { renderTournamentFlyer, FlyerOptions } from "@/lib/flyer/canvasRenderer";
import { TCG_LOGOS, VENUE_LOGOS } from "@/lib/flyer/logos";

export interface TournamentOption {
  id: string;
  name: string;
  tcgSlug: string;
  date: string;
  location?: string | null;
  prize?: string | null;
  bannerUrl?: string | null;
}

interface FlyerGeneratorClientProps {
  tournaments: TournamentOption[];
}

export function FlyerGeneratorClient({ tournaments }: FlyerGeneratorClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modo: libre o vinculado a torneo
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  // Estado del Flyer
  const [tcgSlug, setTcgSlug] = useState<string>("one-piece");
  const [title, setTitle] = useState<string>("TORNEO AVANZADO");
  const [cost, setCost] = useState<string>("$5");
  const [venueKey, setVenueKey] = useState<string>("oracle");
  const [customVenueName, setCustomVenueName] = useState<string>("");
  const [customVenueAddress, setCustomVenueAddress] = useState<string>("");
  const [prizeTitle, setPrizeTitle] = useState<string>("¡REPARTO AL TOP 4!");
  const [prizeSubtitle, setPrizeSubtitle] = useState<string>("(PREMIACIÓN PENSADA PARA UN AFORO DE 12 PERSONAS)");
  const [dateMonth, setDateMonth] = useState<string>("AGOSTO");
  const [dateDay, setDateDay] = useState<string>("30");
  const [dateTime, setDateTime] = useState<string>("11:30 AM");

  // Imagen de fondo y controles de encuadre
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [bgZoom, setBgZoom] = useState<number>(100);
  const [bgPosY, setBgPosY] = useState<number>(50);
  const [bgPosX, setBgPosX] = useState<number>(50);

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [bannerSaved, setBannerSaved] = useState<boolean>(false);
  const [isSavingBanner, setIsSavingBanner] = useState<boolean>(false);

  // Al seleccionar un torneo existente, auto-completar datos
  const handleSelectTournament = (tId: string) => {
    setSelectedTournamentId(tId);
    if (!tId) return;

    const t = tournaments.find((item) => item.id === tId);
    if (!t) return;

    if (t.tcgSlug) {
      if (t.tcgSlug.includes("one-piece") || t.tcgSlug.includes("piece")) setTcgSlug("one-piece");
      else if (t.tcgSlug.includes("yugi") || t.tcgSlug.includes("ygo")) setTcgSlug("yugioh");
      else if (t.tcgSlug.includes("digi")) setTcgSlug("digimon");
    }

    setTitle(t.name.toUpperCase());
    if (t.prize) setPrizeTitle(t.prize);

    if (t.date) {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        setDateMonth(months[d.getMonth()]);
        setDateDay(String(d.getDate()));

        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const minStr = minutes < 10 ? `0${minutes}` : String(minutes);
        setDateTime(`${hours}:${minStr} ${ampm}`);
      }
    }

    if (t.bannerUrl) {
      setBgImageUrl(t.bannerUrl);
    }
  };

  // Función para re-dibujar el canvas
  const drawFlyer = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    try {
      const options: FlyerOptions = {
        tcgSlug,
        title,
        cost,
        venueKey,
        venueName: venueKey === "custom" ? customVenueName : undefined,
        venueAddress: venueKey === "custom" ? customVenueAddress : undefined,
        prizeTitle,
        prizeSubtitle,
        dateMonth,
        dateDay,
        dateTime,
        bgImageUrl,
        bgZoom,
        bgPosY,
        bgPosX,
      };
      await renderTournamentFlyer(canvasRef.current, options);
    } catch (err) {
      console.error("Error renderizando flyer:", err);
    } finally {
      setIsRendering(false);
    }
  }, [
    tcgSlug,
    title,
    cost,
    venueKey,
    customVenueName,
    customVenueAddress,
    prizeTitle,
    prizeSubtitle,
    dateMonth,
    dateDay,
    dateTime,
    bgImageUrl,
    bgZoom,
    bgPosY,
    bgPosX,
  ]);

  useEffect(() => {
    drawFlyer();
  }, [drawFlyer]);

  // Manejo de subida de imagen desde PC
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBgImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Descargar imagen PNG en alta definición
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    link.download = `flyer-${tcgSlug}-${safeTitle}-${dateMonth}-${dateDay}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Copiar imagen al portapapeles
  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (e) {
      alert("No se pudo copiar automáticamente al portapapeles. Usa el botón Descargar.");
    }
  };

  // Asignar flyer como Banner del Torneo en la base de datos
  const handleSaveAsBanner = async () => {
    if (!selectedTournamentId || !canvasRef.current) return;
    setIsSavingBanner(true);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
      const res = await fetch(`/api/tournaments/${selectedTournamentId}/banner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerUrl: dataUrl, bannerPosition: "50" }),
      });
      if (res.ok) {
        setBannerSaved(true);
        setTimeout(() => setBannerSaved(false), 3500);
      }
    } catch (e) {
      console.error(e);
      alert("Error al guardar banner en el torneo.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ─── COLUMNA IZQUIERDA: CONTROLES (7 Cols) ────────────────────────── */}
      <div className="lg:col-span-7 space-y-6">
        {/* Selector de Torneo Vinculado / Modo Libre */}
        <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-black text-white flex items-center gap-2 tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              AUTO-COMPLETAR DESDE TORNEO EXISTENTE (OPCIONAL)
            </label>
            {selectedTournamentId && (
              <button
                type="button"
                onClick={() => handleSelectTournament("")}
                className="text-[10px] font-bold text-yellow-400 hover:underline"
              >
                Limpiar / Modo Libre
              </button>
            )}
          </div>
          <select
            value={selectedTournamentId}
            onChange={(e) => handleSelectTournament(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs font-bold focus:outline-none focus:border-yellow-400"
          >
            <option value="">-- Crear Flyer Libre / Manual (Sin Torneo) --</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.tcgSlug?.toUpperCase() || "TCG"})
              </option>
            ))}
          </select>
        </div>

        {/* Formulario Principal de Datos */}
        <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <h2 className="font-black text-white text-sm tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-yellow-400" /> INFORMACIÓN Y TEXTOS DEL FLYER
          </h2>

          {/* Selector de TCG */}
          <div>
            <label className="block text-[11px] font-black text-slate-300 mb-2 tracking-wider">
              1. JUEGO DE CARTAS (TCG) *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "one-piece", label: "🏴‍☠️ ONE PIECE", color: "hover:border-red-500" },
                { id: "yugioh", label: "⚡ YU-GI-OH!", color: "hover:border-yellow-500" },
                { id: "digimon", label: "🦖 DIGIMON", color: "hover:border-blue-500" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTcgSlug(item.id)}
                  className={`py-3 px-2 rounded-lg text-xs font-black transition-all border ${
                    tcgSlug === item.id
                      ? "bg-yellow-400 text-slate-950 border-yellow-400 shadow-lg shadow-yellow-400/20 scale-[1.02]"
                      : `bg-slate-900 text-slate-300 border-slate-800 ${item.color}`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título y Costo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
                2. TÍTULO DEL EVENTO *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: TORNEO AVANZADO"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-black uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
                3. COSTO / ENTRADA *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-yellow-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Ej: $5 o GRATIS"
                  className="w-full bg-slate-900 border border-slate-700 text-yellow-400 pl-9 pr-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 font-black"
                />
              </div>
            </div>
          </div>

          {/* Sede y Dirección */}
          <div>
            <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
              4. SEDE / LUGAR *
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => {
                  setVenueKey("oracle");
                  setCustomVenueName(VENUE_LOGOS.oracle.name);
                  setCustomVenueAddress(VENUE_LOGOS.oracle.address);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  venueKey === "oracle"
                    ? "bg-yellow-400 text-slate-950 border-yellow-400 font-black"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                }`}
              >
                🦊 Oracle Gaming (Oficial)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVenueKey("zulia");
                  setCustomVenueName(VENUE_LOGOS.zulia.name);
                  setCustomVenueAddress(VENUE_LOGOS.zulia.address);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  venueKey === "zulia"
                    ? "bg-yellow-400 text-slate-950 border-yellow-400 font-black"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                }`}
              >
                👑 Zulia TCG (Sede General)
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={venueKey === "custom" ? customVenueName : VENUE_LOGOS[venueKey]?.name || "ORACLE GAMING"}
                onChange={(e) => {
                  setVenueKey("custom");
                  setCustomVenueName(e.target.value);
                }}
                placeholder="Nombre de la Sede"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold focus:outline-none focus:border-yellow-400"
              />
              <textarea
                rows={2}
                value={venueKey === "custom" ? customVenueAddress : VENUE_LOGOS[venueKey]?.address || ""}
                onChange={(e) => {
                  setVenueKey("custom");
                  setCustomVenueAddress(e.target.value);
                }}
                placeholder="Dirección completa del local..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 resize-none"
              />
            </div>
          </div>

          {/* Premiación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
                5. PREMIO PRINCIPAL *
              </label>
              <input
                type="text"
                value={prizeTitle}
                onChange={(e) => setPrizeTitle(e.target.value)}
                placeholder="Ej: ¡REPARTO AL TOP 4!"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-lg text-xs font-black uppercase focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
                DETALLE / CONDICIÓN PREMIOS
              </label>
              <input
                type="text"
                value={prizeSubtitle}
                onChange={(e) => setPrizeSubtitle(e.target.value)}
                placeholder="Ej: (PREMIACIÓN PENSADA PARA 12 PERSONAS)"
                className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-yellow-400 uppercase"
              />
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
                6. MES *
              </label>
              <input
                type="text"
                value={dateMonth}
                onChange={(e) => setDateMonth(e.target.value.toUpperCase())}
                placeholder="AGOSTO"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs font-black uppercase text-center focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
                DÍA (NÚMERO) *
              </label>
              <input
                type="text"
                value={dateDay}
                onChange={(e) => setDateDay(e.target.value)}
                placeholder="30"
                className="w-full bg-slate-900 border border-slate-700 text-yellow-400 px-3 py-2 rounded-lg text-xs font-black text-center focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-300 mb-1.5 tracking-wider">
                HORA *
              </label>
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs font-black uppercase text-center focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        {/* Subida de Imagen y Controles de Encuadre */}
        <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-black text-white text-sm tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-yellow-400" /> ARTE Y FONDO DEL PERSONAJE
            </h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-3.5 py-1.5 rounded-md text-[11px] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Subir Imagen desde PC
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              className="hidden"
            />
          </div>

          {/* Sliders de Zoom y Posición */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>ZOOM DEL ARTE</span>
                <span className="text-yellow-400">{bgZoom}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="250"
                step="5"
                value={bgZoom}
                onChange={(e) => setBgZoom(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>POSICIÓN VERTICAL (Y)</span>
                <span className="text-yellow-400">{bgPosY}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={bgPosY}
                onChange={(e) => setBgPosY(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>POSICIÓN HORIZONTAL (X)</span>
                <span className="text-yellow-400">{bgPosX}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={bgPosX}
                onChange={(e) => setBgPosX(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── COLUMNA DERECHA: LIVE PREVIEW & EXPORTACIÓN (5 Cols) ────────── */}
      <div className="lg:col-span-5 space-y-5 sticky top-24">
        <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-black text-white text-xs tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              VISTA PREVIA EN VIVO (1080 × 1350 HD)
            </h2>
            <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
              FORMATO INSTAGRAM 4:5
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-black flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-[640px] object-contain shadow-2xl"
              style={{ aspectRatio: "1080 / 1350" }}
            />
            {isRendering && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-3.5 px-6 rounded-lg text-xs tracking-wider transition-all shadow-xl shadow-yellow-400/20 hover:scale-[1.01]"
            >
              <Download className="w-4 h-4" />
              DESCARGAR FLYER EN ALTA RESOLUCIÓN (PNG)
            </button>

            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? "¡Copiado al Portapapeles!" : "Copiar Imagen al Portapapeles"}
            </button>

            {selectedTournamentId && (
              <button
                type="button"
                onClick={handleSaveAsBanner}
                disabled={isSavingBanner}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-4 rounded-lg text-xs transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {bannerSaved ? (
                  <>
                    <Check className="w-4 h-4 text-white" /> ¡ASIGNADO COMO BANNER EN LA WEB!
                  </>
                ) : (
                  <>
                    {isSavingBanner ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    APLICAR COMO BANNER DEL TORNEO
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
