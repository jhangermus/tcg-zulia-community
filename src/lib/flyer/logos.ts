/**
 * Logos oficiales vectoriales y optimizados para el Generador de Flyers
 */

export interface TcgLogoConfig {
  id: string;
  name: string;
  badgeText: string;
  accentColor: string;
  goldColor: string;
  svgLogo: string;
}

// SVG vectoriales nítidos con contornos blancos de alto contraste
export const TCG_LOGOS: Record<string, TcgLogoConfig> = {
  "one-piece": {
    id: "one-piece",
    name: "One Piece Card Game",
    badgeText: "ONE PIECE",
    accentColor: "#dc2626",
    goldColor: "#f59e0b",
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" width="500" height="120">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Jolly Roger Circle & Bones -->
        <circle cx="58" cy="50" r="32" fill="#000000" stroke="#ffffff" stroke-width="4"/>
        <line x1="30" y1="22" x2="86" y2="78" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <line x1="86" y1="22" x2="30" y2="78" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <!-- Straw Hat Skull -->
        <circle cx="58" cy="48" r="16" fill="#ffffff"/>
        <ellipse cx="58" cy="44" rx="20" ry="6" fill="#facc15" stroke="#dc2626" stroke-width="2"/>
        <circle cx="52" cy="48" r="3.5" fill="#000000"/>
        <circle cx="64" cy="48" r="3.5" fill="#000000"/>
        <path d="M 52 56 Q 58 60 64 56" fill="none" stroke="#000000" stroke-width="2.5"/>

        <!-- Text: ONE PIECE -->
        <text x="100" y="62" font-family="'Impact', 'Arial Black', sans-serif" font-size="52" font-weight="900" fill="#ffffff" stroke="#000000" stroke-width="3" letter-spacing="2">ONE PIECE</text>
        
        <!-- Text: CARD GAME -->
        <rect x="135" y="76" width="230" height="24" rx="4" fill="#000000" stroke="#ffffff" stroke-width="2"/>
        <text x="250" y="93" font-family="'Impact', 'Arial Black', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">CARD GAME</text>
      </g>
    </svg>`,
  },
  "yugioh": {
    id: "yugioh",
    name: "Yu-Gi-Oh! OCG / TCG",
    badgeText: "YU-GI-OH!",
    accentColor: "#ef4444",
    goldColor: "#f59e0b",
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" width="500" height="120">
      <defs>
        <filter id="shadowYgo" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#ca8a04"/>
        </linearGradient>
      </defs>
      <g filter="url(#shadowYgo)">
        <!-- Yu-Gi-Oh! Logo Text -->
        <text x="250" y="62" font-family="'Impact', 'Arial Black', sans-serif" font-size="54" font-weight="900" fill="url(#goldGrad)" stroke="#b91c1c" stroke-width="4" text-anchor="middle" font-style="italic" letter-spacing="3">Yu-Gi-Oh!</text>
        <!-- TRADING CARD GAME -->
        <rect x="110" y="76" width="280" height="24" rx="4" fill="#000000" stroke="#eab308" stroke-width="2"/>
        <text x="250" y="93" font-family="'Arial Black', sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">TRADING CARD GAME</text>
      </g>
    </svg>`,
  },
  "digimon": {
    id: "digimon",
    name: "Digimon Card Game",
    badgeText: "DIGIMON",
    accentColor: "#3b82f6",
    goldColor: "#f59e0b",
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" width="500" height="120">
      <defs>
        <filter id="shadowDigi" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#60a5fa"/>
          <stop offset="50%" stop-color="#2563eb"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <g filter="url(#shadowDigi)">
        <!-- DIGIMON -->
        <text x="250" y="60" font-family="'Impact', 'Arial Black', sans-serif" font-size="52" font-weight="900" fill="url(#blueGrad)" stroke="#ffffff" stroke-width="4" text-anchor="middle" font-style="italic" letter-spacing="4">DIGIMON</text>
        <!-- CARD GAME -->
        <rect x="135" y="74" width="230" height="24" rx="4" fill="#000000" stroke="#60a5fa" stroke-width="2"/>
        <text x="250" y="91" font-family="'Impact', 'Arial Black', sans-serif" font-size="15" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="4">CARD GAME</text>
      </g>
    </svg>`,
  },
};

// Logos de Sede para el Footer
export const VENUE_LOGOS: Record<string, { name: string; address: string; svgLogo: string }> = {
  "oracle": {
    name: "ORACLE GAMING",
    address: "Av. Circunvalación 2, Frente a URBE, Local 52 Av. 15P, al lado de Librería Aeropuerto, Maracaibo.",
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
      <defs>
        <linearGradient id="oracleGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <!-- Fox/Anubis Head Icon -->
      <g fill="url(#oracleGold)" stroke="#000000" stroke-width="1">
        <polygon points="35,15 50,45 20,45"/>
        <polygon points="50,15 65,45 35,45"/>
        <circle cx="42" cy="48" r="14"/>
        <polygon points="32,48 42,65 52,48"/>
        <!-- Glasses / Visor -->
        <rect x="30" y="44" width="24" height="6" rx="2" fill="#000000"/>
      </g>
      <!-- Text ORACLE GAMING -->
      <text x="75" y="40" font-family="'Impact', 'Arial Black', sans-serif" font-size="30" font-weight="900" fill="url(#oracleGold)" letter-spacing="3">ORACLE</text>
      <text x="76" y="62" font-family="'Impact', 'Arial Black', sans-serif" font-size="20" font-weight="900" fill="url(#oracleGold)" letter-spacing="4">GAMING</text>
    </svg>`,
  },
  "zulia": {
    name: "ZULIA TCG",
    address: "Comunidad Oficial de Juegos de Cartas Coleccionables de Maracaibo y el Zulia.",
    svgLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
      <defs>
        <linearGradient id="zuliaGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde047"/>
          <stop offset="100%" stop-color="#eab308"/>
        </linearGradient>
      </defs>
      <!-- Crown Icon -->
      <path d="M 20 55 L 20 30 L 32 42 L 42 22 L 52 42 L 64 30 L 64 55 Z" fill="url(#zuliaGold)" stroke="#000000" stroke-width="2"/>
      <!-- Text ZULIA TCG -->
      <text x="80" y="40" font-family="'Impact', 'Arial Black', sans-serif" font-size="30" font-weight="900" fill="#ffffff" letter-spacing="2">ZULIA <tspan fill="url(#zuliaGold)">TCG</tspan></text>
      <text x="80" y="60" font-family="'Arial Black', sans-serif" font-size="12" font-weight="900" fill="#94a3b8" letter-spacing="4">COMUNIDAD OFICIAL</text>
    </svg>`,
  },
};
