import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/** POST /api/tournaments/[id]/banner */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { bannerUrl, bannerPosition = "50" } = body;

    if (!bannerUrl) {
      return NextResponse.json({ error: "Falta bannerUrl" }, { status: 400 });
    }

    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        bannerUrl,
        bannerPosition: String(bannerPosition),
      },
    });

    revalidatePath("/torneos");
    revalidatePath("/admin/torneos");
    revalidatePath("/");

    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    console.error("Error updating tournament banner:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: String(error) },
      { status: 500 }
    );
  }
}
