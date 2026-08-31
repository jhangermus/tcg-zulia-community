import { prisma } from '@/lib/prisma';

async function migrateDeckCovers() {
  console.log("Fetching decklists without coverImageUrl...");
  const decklists = await prisma.decklist.findMany({
    where: {
      coverImageUrl: null,
    },
    select: {
      id: true,
      deckData: true,
    },
  });

  console.log(`Found ${decklists.length} decks to process.`);

  let updated = 0;
  for (const deck of decklists) {
    try {
      if (!deck.deckData) continue;
      const parsed = JSON.parse(deck.deckData);
      
      let cover = null;
      if (parsed.main && parsed.main.length > 0) {
        cover = parsed.main[0].image_url;
      } else if (parsed.extra && parsed.extra.length > 0) {
        cover = parsed.extra[0].image_url;
      }

      if (cover) {
        await prisma.decklist.update({
          where: { id: deck.id },
          data: { coverImageUrl: cover },
        });
        updated++;
      }
    } catch (e) {
      console.error(`Failed to parse deckData for deck ${deck.id}`);
    }
  }

  console.log(`Successfully updated ${updated} deck covers.`);
}

migrateDeckCovers()
  .catch(e => console.error(e));
