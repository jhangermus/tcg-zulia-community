import Link from "next/link";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6 space-y-6 bg-[#05080f] min-h-screen">
      {/* ROW 1: Hero & Next Tournament */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Hero Carousel */}
        <div className="xl:col-span-2 relative rounded-xl overflow-hidden bg-gradient-to-r from-[#001736] to-[#040914] border border-slate-800 p-8 flex flex-col justify-between min-h-[350px]">
          {/* Paint Splatter decorative background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10 w-full md:w-1/2">
            <h2 className="text-xl italic font-bold text-white mb-2">BIENVENIDO A</h2>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-1 drop-shadow-lg">
              ZULIA <span className="text-yellow-400">TCG</span>
            </h1>
            <p className="text-sm font-bold text-slate-300 tracking-widest mb-8">TORNEOS • DECKLISTS • RANKING • COMUNIDAD</p>
            <Link href="/torneos" className="inline-block bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold text-sm px-6 py-2 rounded transition-colors tracking-widest">
              VER PRÓXIMO TORNEO
            </Link>
          </div>

          {/* Cards Graphic Placeholder */}
          <div className="absolute right-0 top-0 h-full w-1/2 hidden md:flex items-center justify-end pr-8">
            <div className="w-64 h-80 bg-slate-800/50 rounded shadow-2xl border border-slate-700 transform rotate-12 flex items-center justify-center">
              <span className="text-slate-500 font-bold">Yu-Gi-Oh! Cards</span>
            </div>
          </div>
        </div>

        {/* Proximo Torneo */}
        <div className="bg-[#0a0e17] rounded-xl border border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider">PRÓXIMO TORNEO</h3>
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center text-center mb-6 relative">
             <h2 className="text-4xl font-black italic text-white drop-shadow-md z-10">COPA ZULIA <span className="text-blue-500">#09</span></h2>
             <span className="text-red-500 font-bold mt-2 text-sm">YU-GI-OH!</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300 mb-6">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500"/> DOM 02 JUN 2024</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 text-slate-500 flex items-center justify-center">🕒</div> 10:00 AM</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500"/> MARACAIBO</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500"/> 64 JUGADORES</div>
            <div className="col-span-2 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500"/> PREMIO: $7.000</div>
          </div>

          <Link href="/torneos" className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded text-sm transition-colors tracking-widest mt-auto">
            VER DETALLES
          </Link>
        </div>
      </div>

      {/* ROW 2: Ultimos Torneos, Top Decks, Ranking */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Ultimos Torneos (span 4) */}
        <div className="xl:col-span-4 bg-[#0a0e17] rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider mb-4">ÚLTIMOS TORNEOS</h3>
          <div className="flex gap-4">
            <div className="w-32 h-40 bg-slate-800 rounded flex items-center justify-center text-center p-2 relative overflow-hidden">
               <span className="relative z-10 text-yellow-400 font-black italic text-sm">CAMPEÓN<br/>JHANGER U.</span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="font-bold text-lg text-white">COPA ZULIA #08</h4>
              <p className="text-[10px] text-slate-500 mb-3">26 MAY 2024 • 64 JUGADORES</p>
              <div className="space-y-1 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-yellow-500 text-black flex items-center justify-center text-[8px]">1</span> Jhanger U.</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-400 text-black flex items-center justify-center text-[8px]">2</span> Luisdavid</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-orange-700 text-white flex items-center justify-center text-[8px]">3</span> Rafael A.</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[8px]">4</span> Angel D.</div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href="/torneos" className="flex-1 text-center border border-blue-500 text-blue-400 text-[10px] font-bold py-1.5 rounded hover:bg-blue-500 hover:text-white transition-colors">VER RESULTADOS</Link>
                <Link href="/decks" className="flex-1 text-center border border-slate-600 text-slate-300 text-[10px] font-bold py-1.5 rounded hover:bg-slate-600 transition-colors">VER TOP DECKS</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Top Decks (span 5) */}
        <div className="xl:col-span-5 bg-[#0a0e17] rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-300 tracking-wider mb-4">TOP DECKS</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Deck 1 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[3/4] bg-slate-800 rounded border border-slate-700 mb-2 relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xs border-2 border-[#0a0e17]">1</div>
              </div>
              <span className="font-bold text-xs text-white uppercase text-center">SNAKE-EYE</span>
              <span className="text-[10px] text-red-500 font-bold mb-1">YU-GI-OH!</span>
              <span className="text-[9px] text-slate-500">TOP 1</span>
            </div>
            {/* Deck 2 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[3/4] bg-slate-800 rounded border border-slate-700 mb-2 relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-black font-bold text-xs border-2 border-[#0a0e17]">2</div>
              </div>
              <span className="font-bold text-xs text-white uppercase text-center">R/B LUFFY</span>
              <span className="text-[10px] text-purple-500 font-bold mb-1">ONE PIECE</span>
              <span className="text-[9px] text-slate-500">TOP 2</span>
            </div>
            {/* Deck 3 */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-[3/4] bg-slate-800 rounded border border-slate-700 mb-2 relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-700 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-[#0a0e17]">3</div>
              </div>
              <span className="font-bold text-xs text-white uppercase text-center">BLUE FLARE</span>
              <span className="text-[10px] text-blue-500 font-bold mb-1">DIGIMON</span>
              <span className="text-[9px] text-slate-500">TOP 3</span>
            </div>
          </div>
        </div>

        {/* Ranking (span 3) */}
        <div className="xl:col-span-3 bg-[#0a0e17] rounded-xl border border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider">RANKING DE JUGADORES</h3>
            <Link href="/ranking" className="text-[10px] text-blue-400 font-bold hover:text-blue-300">VER RANKING</Link>
          </div>
          <div className="flex flex-col gap-4 flex-grow justify-center">
            {[ 
              { pos: '01', name: 'Jhanger U.', pts: '842 pts', color: 'text-yellow-500' },
              { pos: '02', name: 'Luisdavid', pts: '731 pts', color: 'text-slate-400' },
              { pos: '03', name: 'Rafael A.', pts: '698 pts', color: 'text-orange-700' },
              { pos: '04', name: 'Angel D.', pts: '641 pts', color: 'text-slate-500' },
              { pos: '05', name: 'Gustavo S.', pts: '592 pts', color: 'text-slate-500' }
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-black text-sm ${p.color}`}>{p.pos}</span>
                  <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                  <span className="font-bold text-sm text-slate-200">{p.name}</span>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{p.pts}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 3: Noticias y Tienda */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 bg-[#0a0e17] rounded-xl border border-slate-800 p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-slate-300 tracking-wider">NOTICIAS Y ACTUALIDAD</h3>
             <Link href="/noticias" className="text-[10px] text-blue-400 font-bold hover:text-blue-300">VER TODAS</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
               <div className="h-24 bg-slate-800 relative"><span className="absolute top-2 left-2 bg-purple-600 text-[8px] font-bold px-2 py-0.5 rounded text-white">RESULTADOS</span></div>
               <div className="p-3">
                 <h4 className="font-bold text-sm text-white mb-1">Copa Zulia #08</h4>
                 <p className="text-[10px] text-slate-400 mb-2">Revive los mejores momentos del torneo.</p>
                 <span className="text-[9px] text-slate-500">26 MAY 2024</span>
               </div>
            </div>
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
               <div className="h-24 bg-slate-800 relative"><span className="absolute top-2 left-2 bg-blue-600 text-[8px] font-bold px-2 py-0.5 rounded text-white">DECK PROFILE</span></div>
               <div className="p-3">
                 <h4 className="font-bold text-sm text-white mb-1">Snake-Eye</h4>
                 <p className="text-[10px] text-slate-400 mb-2">Deck profile del campeón</p>
                 <span className="text-[9px] text-slate-500">25 MAY 2024</span>
               </div>
            </div>
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
               <div className="h-24 bg-slate-800 relative"><span className="absolute top-2 left-2 bg-green-600 text-[8px] font-bold px-2 py-0.5 rounded text-white">COMUNIDAD</span></div>
               <div className="p-3">
                 <h4 className="font-bold text-sm text-white mb-1">Torneo One Piece</h4>
                 <p className="text-[10px] text-slate-400 mb-2">Gran participación en comunidad</p>
                 <span className="text-[9px] text-slate-500">24 MAY 2024</span>
               </div>
            </div>
          </div>
        </div>

        {/* Tienda Banner */}
        <div className="bg-gradient-to-br from-[#001736] to-black rounded-xl border border-blue-900/50 p-6 flex flex-col justify-center items-start relative overflow-hidden">
           <div className="relative z-10">
             <h2 className="text-3xl font-black italic text-yellow-400 leading-tight mb-2">VISITA NUESTRA<br/><span className="text-white">TIENDA</span></h2>
             <p className="text-[10px] font-semibold text-slate-300 w-2/3 mb-6">PLAYMATS, SLEEVES, ACCESORIOS Y MUCHO MÁS</p>
             <Link href="/tienda" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded text-sm transition-colors tracking-widest">
               IR A LA TIENDA
             </Link>
           </div>
           <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-slate-800 opacity-50 transform rotate-12 rounded"></div>
           <div className="absolute right-4 top-4 w-16 h-24 bg-slate-800 opacity-50 transform -rotate-12 rounded"></div>
        </div>
      </div>
    </div>
  );
}
