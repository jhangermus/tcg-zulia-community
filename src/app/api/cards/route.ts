import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Shape expected by UI
export interface NormalizedCard {
  id: string | number;
  name: string;
  type?: string;
  image_url: string;
  slot: 'main' | 'extra' | 'leader' | 'egg';
}

// In-memory cache for Yu-Gi-Oh! API calls
const ygoCache = new Map<string, { timestamp: number; cards: NormalizedCard[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Datasets loaded lazily in memory on first request
let onePieceCards: any[] | null = null;
let digimonCards: any[] | null = null;

function getOnePieceCards() {
  if (!onePieceCards) {
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'onepiece_cards.json');
      if (fs.existsSync(filePath)) {
        onePieceCards = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else {
        onePieceCards = [];
      }
    } catch {
      onePieceCards = [];
    }
  }
  return onePieceCards || [];
}

function getDigimonCards() {
  if (!digimonCards) {
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'digimon_cards.json');
      if (fs.existsSync(filePath)) {
        digimonCards = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } else {
        digimonCards = [];
      }
    } catch {
      digimonCards = [];
    }
  }
  return digimonCards || [];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tcg = url.searchParams.get('tcg')?.toLowerCase() || '';
  const query = url.searchParams.get('q')?.trim() || '';

  if (!query) {
    return NextResponse.json({ cards: [] });
  }

  // Normalize TCG identifier (accepting slug or common names)
  let game = 'yugioh';
  if (tcg.includes('one') || tcg.includes('piece') || tcg.includes('op')) {
    game = 'onepiece';
  } else if (tcg.includes('digi')) {
    game = 'digimon';
  } else if (tcg.includes('yugi') || tcg.includes('ygo')) {
    game = 'yugioh';
  }

  try {
    // 1. ONE PIECE (Local Database)
    if (game === 'onepiece') {
      const allCards = getOnePieceCards();
      const lowerQuery = query.toLowerCase();
      const filtered = allCards
        .filter((c: any) =>
          c.name?.toLowerCase().includes(lowerQuery) ||
          c.id?.toLowerCase().includes(lowerQuery) ||
          c.types?.some((t: string) => t.toLowerCase().includes(lowerQuery))
        )
        .slice(0, 20);

      const cards: NormalizedCard[] = filtered.map((c: any) => {
        const isLeader = c.category?.toLowerCase() === 'leader';
        return {
          id: c.id,
          name: c.name,
          type: `${c.category || 'Card'}${c.colors ? ` • ${c.colors.join('/')}` : ''}`,
          image_url: c.img ? `/api/proxy-image?url=${encodeURIComponent(c.img)}` : '',
          slot: isLeader ? 'leader' : 'main',
        };
      });

      return NextResponse.json({ cards });
    }

    // List of known Digimon Eggs / Tamas
    const DIGI_EGGS_NAMES = new Set([
      "tsumemon", "koromon", "gigimon", "tanemon", "tokomon", "demiveemon", "upamon", "poromon",
      "mochimon", "motimon", "nyaromon", "pagumon", "yokomon", "pyocomon", "bukamon", "minomon",
      "yaamon", "hopmon", "caprimon", "chibimon", "gummymon", "chocomon", "kokomon", "pickmon",
      "dorimon", "kyokyomon", "wanyamon", "cupimon", "pinamon", "puroromon", "torikaraballmon",
      "bebydomon", "kyaromon", "frimon", "viximon", "sakuttomon", "kakkinmon", "sunamon", "goromon",
      "bibimon", "bosamon", "bowmon", "chapmon", "dokimon", "leafmon", "zurumon", "botamon",
      "punimon", "poyomon", "pabumon", "jyarimon", "cocomon", "popomon", "pipimon", "ketomon",
      "fufumon", "bubbmon", "puwamon", "dodomon", "kuramon", "pafumon", "puttimon", "pichimon",
      "petitmon", "yukimibotamon", "zerimon", "conomon", "kiimon", "bombmon", "tsunomon",
      "gurimon", "yarimon", "monimon", "kodokugumon"
    ]);

    // 2. DIGIMON (Local Database)
    if (game === 'digimon') {
      const allCards = getDigimonCards();
      const lowerQuery = query.toLowerCase();
      const filtered = allCards
        .filter((c: any) =>
          c.name?.toLowerCase().includes(lowerQuery) ||
          c.id?.toLowerCase().includes(lowerQuery) ||
          c.type?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 20);

      const cards: NormalizedCard[] = filtered.map((c: any) => {
        const nameLower = (c.name || '').toLowerCase().trim();
        const typeLower = (c.type || c.card_type || '').toLowerCase();
        const idStr = String(c.id || '');
        const isEgg =
          c.card_type === 'egg' ||
          typeLower.includes('egg') ||
          typeLower.includes('tama') ||
          typeLower.includes('in-training') ||
          DIGI_EGGS_NAMES.has(nameLower) ||
          DIGI_EGGS_NAMES.has(nameLower.split(' ')[0]) ||
          /^[A-Z0-9]+-(00[1-6])$/i.test(idStr);

        return {
          id: c.id,
          name: c.name,
          type: `${isEgg ? 'Digi-Egg' : c.type || 'Digimon'}${c.color ? ` • ${c.color}` : ''}`,
          image_url: c.img ? `/api/proxy-image?url=${encodeURIComponent(c.img)}` : '',
          slot: isEgg ? 'egg' : 'main',
        };
      });

      return NextResponse.json({ cards });
    }

    // 3. YU-GI-OH! (YGOPRODeck API with In-Memory Cache)
    const lowerQuery = query.toLowerCase();
    const cached = ygoCache.get(lowerQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ cards: cached.cards });
    }

    const ygoRes = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}&num=20&offset=0`,
      {
        headers: {
          'User-Agent': 'ZuliaTCG-Community/1.0',
        },
      }
    );

    if (!ygoRes.ok) {
      return NextResponse.json({ cards: [] });
    }

    const json = await ygoRes.json();
    const rawCards = json.data || [];

    const cards: NormalizedCard[] = rawCards.map((c: any) => {
      const typeLower = (c.type || '').toLowerCase();
      const isExtra =
        typeLower.includes('fusion') ||
        typeLower.includes('synchro') ||
        typeLower.includes('xyz') ||
        typeLower.includes('link');
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        image_url:
          c.card_images?.[0]?.image_url ||
          `https://images.ygoprodeck.com/images/cards/${c.id}.jpg`,
        slot: isExtra ? 'extra' : 'main',
      };
    });

    ygoCache.set(lowerQuery, { timestamp: Date.now(), cards });
    return NextResponse.json({ cards });
  } catch (err) {
    console.error('Error fetching cards:', err);
    return NextResponse.json({ cards: [] });
  }
}
