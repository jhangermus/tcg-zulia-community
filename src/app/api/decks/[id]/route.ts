import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This route is called lazily only when a user opens a deck modal.
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing deck id" }, { status: 400 });
  }

  const deck = await prisma.decklist.findUnique({
    where: { id },
    select: { deckData: true },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  let parsedData = { main: [] as unknown[], extra: [] as unknown[], side: [] as unknown[] };

  try {
    if (typeof deck.deckData === "string") {
      parsedData = JSON.parse(deck.deckData as string);
    } else {
      parsedData = deck.deckData as any;
    }
  } catch (e) {
    console.error("Error parsing deckData for deck", id, e);
  }

  return NextResponse.json({
    deckData: {
      main: parsedData.main || [],
      extra: parsedData.extra || [],
      side: parsedData.side || [],
    },
  });
}