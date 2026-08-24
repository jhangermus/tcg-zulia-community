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
          image_url: c.img || '',
          slot: isLeader ? 'leader' : 'main',
        };
      });

      return NextResponse.json({ cards });
    }

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
        const isEgg = c.card_type === 'egg' || c.type?.toLowerCase().includes('egg');
        return {
          id: c.id,
          name: c.name,
          type: `${c.type || 'Digimon'}${c.color ? ` • ${c.color}` : ''}`,
          image_url: c.img || '',
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
      const isExtra =
        c.type?.includes('Fusion') ||
        c.type?.includes('Synchro') ||
        c.type?.includes('XYZ') ||
        c.type?.includes('Link');
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
