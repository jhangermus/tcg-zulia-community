import { Users, Link2, Phone, Save } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function ComunidadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Users className="text-pink-400 w-8 h-8" /> Comunidad
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Configura los datos de contacto y redes sociales.</p>
      </div>

      {/* Social Links */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
        <h2 className="font-black text-white text-lg mb-6">Redes Sociales y Contacto</h2>
        <form className="space-y-5">
          {[
            { name: "instagram_url", label: "Instagram", icon: FaInstagram, placeholder: "https://instagram.com/zulia.tcg", color: "text-pink-500" },
            { name: "discord_url", label: "Discord (Invitación)", icon: Link2, placeholder: "https://discord.gg/...", color: "text-indigo-500" },
            { name: "whatsapp_number", label: "WhatsApp (Número)", icon: Phone, placeholder: "+58 424 0000000", color: "text-green-500" },
            { name: "youtube_url", label: "YouTube", icon: FaYoutube, placeholder: "https://youtube.com/@zuliatchg", color: "text-red-500" },
            { name: "tiktok_url", label: "TikTok", icon: Link2, placeholder: "https://tiktok.com/@zulia.tcg", color: "text-white" },
          ].map((field) => (
            <div key={field.name} className="flex items-center gap-4">
              <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center`}>
                <field.icon className={`w-5 h-5 ${field.color}`} />
              </div>
              <div className="flex-grow">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 tracking-wider">{field.label.toUpperCase()}</label>
                <input
                  name={field.name}
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-400 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-black px-8 py-2.5 rounded-lg text-sm transition-colors tracking-wider">
              <Save className="w-4 h-4" /> GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-xl p-6">
        <h2 className="font-black text-white text-lg mb-6">Información de la Tienda</h2>
        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">DIRECCIÓN</label>
              <input name="address" placeholder="Ej: Av. 4 Bella Vista, Maracaibo" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">HORARIO</label>
              <input name="schedule" placeholder="Ej: Lun-Vie 10am-8pm" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-pink-400 transition-all" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-black px-8 py-2.5 rounded-lg text-sm transition-colors tracking-wider">
              <Save className="w-4 h-4" /> GUARDAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
