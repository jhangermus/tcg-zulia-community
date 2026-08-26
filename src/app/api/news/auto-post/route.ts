import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const AUTO_POST_SECRET = process.env.AUTO_POST_SECRET || "zulia-tcg-auto-news-secret-2024";

/**
 * POST /api/news/auto-post
 * Endpoint seguro para auto-publicar leaks y noticias desde Discord o fuentes automatizadas
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      secret,
      title,
      content,
      imageUrl,
      tag = "LEAKS & REVEALS",
      tcgSlug = "digimon",
      sourceName = "Discord Leaks",
      sourceUrl,
    } = body;

    // Verificar clave secreta
    if (!secret || secret !== AUTO_POST_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: "Título y contenido son requeridos" }, { status: 400 });
    }

    // Evitar duplicados recientes si ya existe una noticia con el mismo título
    const existing = await prisma.news.findFirst({
      where: {
        title: title.trim(),
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // En las últimas 24 horas
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Noticia ya publicada previamente (omitido duplicado)",
        newsId: existing.id,
      });
    }

    // Crear la noticia
    const news = await prisma.news.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl || null,
        tag: tag || "LEAKS & REVEALS",
        tcgSlug: tcgSlug || "digimon",
        sourceName: sourceName || "Discord Leaks",
        sourceUrl: sourceUrl || null,
        published: true,
      },
    });

    // Revalidar rutas para que aparezca de inmediato en la web
    revalidatePath("/noticias");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Noticia auto-publicada con éxito",
      newsId: news.id,
      title: news.title,
    });
  } catch (error) {
    console.error("Error in /api/news/auto-post:", error);
    return NextResponse.json({ error: "Error interno del servidor", details: String(error) }, { status: 500 });
  }
}
