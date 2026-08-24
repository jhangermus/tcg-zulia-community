import { MapPin, Clock, Users, Phone, MessageSquare, Heart, ShieldAlert, Sparkles } from "lucide-react";
import { FaInstagram, FaDiscord, FaWhatsapp, FaYoutube, FaTiktok } from "react-icons/fa";

export default function ComunidadPage() {
  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#05080f] min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black italic tracking-tighter text-white">
          COMUNIDAD <span className="text-yellow-400">TCG ZULIA</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          La casa de todos los duelistas y jugadores de cartas coleccionables en Maracaibo y el Estado Zulia.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Info, Location, Rules */}
        <div className="xl:col-span-2 space-y-6">
          {/* Welcome Card */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black italic text-white mb-3 flex items-center gap-2">
                <Users className="w-6 h-6 text-yellow-400" /> ¡Únete a los Duelos Presenciales!
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Nos reunimos semanalmente para jugar torneos locales, intercambiar cartas (trades), testear los nuevos metas y compartir entre apasionados de Yu-Gi-Oh!, One Piece Card Game y Digimon Card Game.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400"></span> Ambiente Competitivo y Casual</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Premios en Efectivo y Cartas</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Bienvenida a Nuevos Jugadores</span>
              </div>
            </div>
          </div>

          {/* Ubicación y Horarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Card */}
            <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">Punto de Encuentro</h3>
              <p className="text-xs text-slate-400 mb-4">Zona norte y centro de la ciudad de Maracaibo.</p>
              <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 text-xs font-semibold text-slate-300 space-y-1">
                <p className="text-white font-bold">Maracaibo, Edo. Zulia</p>
                <p className="text-slate-400">Venezuela</p>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">Días de Torneo</h3>
              <p className="text-xs text-slate-400 mb-4">Horarios habituales de juego presencial.</p>
              <div className="space-y-2 text-xs font-semibold text-slate-300">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span>Viernes (Casual & Locals):</span>
                  <span className="text-yellow-400 font-bold">2:00 PM - 7:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span>Sábados (Torneos Oficiales):</span>
                  <span className="text-yellow-400 font-bold">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingos (Copa Zulia):</span>
                  <span className="text-yellow-400 font-bold">11:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Código de Conducta */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-yellow-400" /> Código de Comunidad y Juego Limpio
            </h3>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed list-disc list-inside">
              <li>Respeto mutuo absoluto entre jugadores, jueces y organizadores.</li>
              <li>Cuidado de las cartas ajenas durante los cortes y duelos.</li>
              <li>Fomento del aprendizaje para jugadores novatos o que están armando su primer deck.</li>
              <li>Cero tolerancia a conductas antideportivas o trampas.</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Social Networks & Direct Contact */}
        <div className="space-y-6">
          <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-black text-white mb-4">CANALES OFICIALES</h3>
            <div className="space-y-3">
              <a
                href="https://chat.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:border-green-500 text-slate-200 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-slate-950 flex-shrink-0">
                  <FaWhatsapp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-xs text-white">GRUPO DE WHATSAPP</p>
                  <p className="text-[11px] text-slate-400">Avisos de torneos y compra/venta</p>
                </div>
              </a>

              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500 text-slate-200 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <FaDiscord className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-xs text-white">SERVIDOR DE DISCORD</p>
                  <p className="text-[11px] text-slate-400">Salas de voz, testing y debate de metas</p>
                </div>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20 hover:border-pink-500 text-slate-200 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <FaInstagram className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-xs text-white">INSTAGRAM</p>
                  <p className="text-[11px] text-slate-400">@zulia.tcg • Fotos y anuncios</p>
                </div>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500 text-slate-200 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0">
                  <FaYoutube className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-xs text-white">YOUTUBE</p>
                  <p className="text-[11px] text-slate-400">Partidas grabadas y deck profiles</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
