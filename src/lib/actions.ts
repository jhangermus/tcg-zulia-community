"use server";

import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("No autorizado");
  }
}

// --- AUTH ACTIONS ---

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas." };
        default:
          return { error: "Algo salió mal." };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}

// --- TCG ACTIONS ---

const TcgSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  status: z.enum(["ACTIVE", "SUSPENDED", "NOT_PLAYED"]),
  color: z.string().optional(),
});

export async function createTcg(formData: FormData) {
  await requireAdmin();
  const validated = TcgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    color: formData.get("color"),
  });

  if (!validated.success) {
    return;
  }

  await prisma.tcg.create({ data: validated.data });
  revalidatePath("/admin/tcgs");
  revalidatePath("/");
}

export async function updateTcgStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.tcg.update({ where: { id }, data: { status } });
  revalidatePath("/admin/tcgs");
  revalidatePath("/");
}

export async function deleteTcg(id: string) {
  await requireAdmin();
  await prisma.tcg.delete({ where: { id } });
  revalidatePath("/admin/tcgs");
  revalidatePath("/");
}

// --- NEWS ACTIONS ---

const NewsSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  tag: z.string().default("NOTICIAS"),
  tcgSlug: z.string().optional(),
  imageUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourceName: z.string().optional(),
  publishedAt: z.string().optional(),
  published: z.coerce.boolean().default(true),
});

export async function createNews(formData: FormData) {
  await requireAdmin();
  const publishedAtRaw = formData.get("publishedAt") as string;
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();

  const validated = NewsSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    tag: formData.get("tag") || "NOTICIAS",
    tcgSlug: formData.get("tcgSlug") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    sourceUrl: formData.get("sourceUrl") || undefined,
    sourceName: formData.get("sourceName") || undefined,
    published: formData.get("published") !== "false",
  });

  if (!validated.success) return { error: "Datos inválidos" };

  await prisma.news.create({
    data: {
      ...validated.data,
      publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    },
  });

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
  return { success: true };
}

export async function updateNews(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID no proporcionado" };

  const publishedAtRaw = formData.get("publishedAt") as string;
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();

  const validated = NewsSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    tag: formData.get("tag") || "NOTICIAS",
    tcgSlug: formData.get("tcgSlug") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    sourceUrl: formData.get("sourceUrl") || undefined,
    sourceName: formData.get("sourceName") || undefined,
    published: formData.get("published") !== "false",
  });

  if (!validated.success) return { error: "Datos inválidos" };

  await prisma.news.update({
    where: { id },
    data: {
      ...validated.data,
      publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    },
  });

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
  return { success: true };
}

export async function deleteNews(id: string) {
  await requireAdmin();
  await prisma.news.delete({ where: { id } });
  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

export async function toggleNewsPublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.news.update({ where: { id }, data: { published } });
  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

export async function syncExternalNewsAction() {
  await requireAdmin();
  const { syncAllExternalNews } = await import("./news-fetcher");
  const result = await syncAllExternalNews();
  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
  return result;
}

// --- PRODUCT ACTIONS ---

const ProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["AVAILABLE", "OUT_OF_STOCK", "HIDDEN"]),
});

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const validated = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl") || undefined,
    category: formData.get("category") || undefined,
    status: formData.get("status") || "AVAILABLE",
  });

  if (!validated.success) return;

  await prisma.product.create({ data: validated.data });
  revalidatePath("/admin/tienda");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/tienda");
}

// --- TOURNAMENT ACTIONS ---

/** Generates a URL-safe slug from a string */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: á→a, é→e, etc.
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric except spaces/hyphens
    .trim()
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-");            // collapse multiple hyphens
}

/** Returns a unique slug, appending -2 / -3 etc. if there's a collision */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 1;
  while (true) {
    const existing = await prisma.tournament.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    suffix++;
    slug = `${slugify(base)}-${suffix}`;
  }
}

const TournamentSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  location: z.string().optional(),
  prize: z.string().optional(),
  photoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  bannerPosition: z.string().optional(),
  tcgId: z.string().min(1, "Selecciona un TCG"),
  participantsCount: z.coerce.number().int().min(0),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]),
});

export async function createTournament(formData: FormData) {
  await requireAdmin();
  const validated = TournamentSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    location: formData.get("location") || undefined,
    prize: formData.get("prize") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    bannerUrl: formData.get("bannerUrl") || undefined,
    bannerPosition: formData.get("bannerPosition") || "50",
    tcgId: formData.get("tcgId"),
    participantsCount: formData.get("participantsCount") || 0,
    status: formData.get("status") || "UPCOMING",
  });

  if (!validated.success) return { error: "Datos inválidos" };

  const { date, ...rest } = validated.data;
  const slug = await uniqueSlug(rest.name);
  await prisma.tournament.create({ data: { ...rest, slug, date: new Date(date) } });
  revalidatePath("/admin/torneos");
  revalidatePath("/torneos");
  revalidatePath("/");
  return { success: true };
}

export async function updateTournament(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID no proporcionado" };

  const validated = TournamentSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    location: formData.get("location") || undefined,
    prize: formData.get("prize") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    bannerUrl: formData.get("bannerUrl") || undefined,
    bannerPosition: formData.get("bannerPosition") || "50",
    tcgId: formData.get("tcgId"),
    participantsCount: formData.get("participantsCount") || 0,
    status: formData.get("status") || "UPCOMING",
  });

  if (!validated.success) return { error: "Datos inválidos" };

  const { date, ...rest } = validated.data;
  // Keep existing slug if name unchanged, regenerate if name changed
  const existing = await prisma.tournament.findUnique({ where: { id } });
  const slug = existing?.name === rest.name && existing?.slug
    ? existing.slug
    : await uniqueSlug(rest.name, id);

  await prisma.tournament.update({
    where: { id },
    data: { ...rest, slug, date: new Date(date) },
  });
  revalidatePath("/admin/torneos");
  revalidatePath("/torneos");
  revalidatePath(`/torneos/${slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteTournament(id: string) {
  await requireAdmin();
  await prisma.tournament.delete({ where: { id } });
  revalidatePath("/admin/torneos");
  revalidatePath("/torneos");
  revalidatePath("/");
}

// --- DECKLIST ACTIONS ---

const DecklistSchema = z.object({
  playerName: z.string().min(1, "El nombre del jugador/autor es requerido"),
  deckName: z.string().min(1, "El nombre del deck es requerido"),
  placement: z.coerce.number().int().default(0),
  tournamentId: z.string().optional().nullable(),
  isRecommended: z.coerce.boolean().default(false),
  tcgId: z.string().min(1, "Selecciona un TCG"),
  deckData: z.string().min(2),
  adminNotes: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export async function createDecklist(formData: FormData) {
  await requireAdmin();
  const isRecommended = formData.get("isRecommended") === "true" || formData.get("isRecommended") === "on";
  const tournamentIdRaw = formData.get("tournamentId") as string;
  const tournamentId = tournamentIdRaw && tournamentIdRaw.trim() !== "" ? tournamentIdRaw.trim() : null;

  const validated = DecklistSchema.safeParse({
    playerName: formData.get("playerName"),
    deckName: formData.get("deckName"),
    placement: formData.get("placement") || 0,
    tournamentId: tournamentId,
    isRecommended: isRecommended,
    tcgId: formData.get("tcgId"),
    deckData: formData.get("deckData"),
    adminNotes: formData.get("adminNotes") ? String(formData.get("adminNotes")) : undefined,
    coverImageUrl: formData.get("coverImageUrl") ? String(formData.get("coverImageUrl")) : undefined,
  });

  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  const cleanPlayerName = validated.data.playerName.trim();

  // Find or create Player in DB
  let player = await prisma.player.findFirst({
    where: { name: { equals: cleanPlayerName, mode: "insensitive" } },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        name: cleanPlayerName,
        avatarUrl: validated.data.coverImageUrl || null,
      },
    });
  } else if (validated.data.coverImageUrl && !player.avatarUrl) {
    await prisma.player.update({
      where: { id: player.id },
      data: { avatarUrl: validated.data.coverImageUrl },
    });
  }

  await prisma.decklist.create({
    data: {
      ...validated.data,
      playerName: cleanPlayerName,
      playerId: player.id,
      tournamentId: validated.data.tournamentId || undefined,
    },
  });

  // Recalculate player ranking points
  await recalculatePlayerPoints(player.id);

  revalidatePath("/admin/decks");
  revalidatePath("/admin/torneos");
  revalidatePath("/decks");
  revalidatePath("/recomendadas");
  revalidatePath("/torneos");
  revalidatePath("/ranking");
  revalidatePath(`/jugador/${encodeURIComponent(cleanPlayerName)}`);
  revalidatePath("/");
  return { success: true };
}

export async function updateDecklist(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID no proporcionado" };

  const isRecommended = formData.get("isRecommended") === "true" || formData.get("isRecommended") === "on";
  const tournamentIdRaw = formData.get("tournamentId") as string;
  const tournamentId = tournamentIdRaw && tournamentIdRaw.trim() !== "" ? tournamentIdRaw.trim() : null;

  const validated = DecklistSchema.safeParse({
    playerName: formData.get("playerName"),
    deckName: formData.get("deckName"),
    placement: formData.get("placement") || 0,
    tournamentId: tournamentId,
    isRecommended: isRecommended,
    tcgId: formData.get("tcgId"),
    deckData: formData.get("deckData"),
    adminNotes: formData.get("adminNotes") ? String(formData.get("adminNotes")) : undefined,
    coverImageUrl: formData.get("coverImageUrl") ? String(formData.get("coverImageUrl")) : undefined,
  });

  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  const cleanPlayerName = validated.data.playerName.trim();

  // Find or create Player in DB
  let player = await prisma.player.findFirst({
    where: { name: { equals: cleanPlayerName, mode: "insensitive" } },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        name: cleanPlayerName,
        avatarUrl: validated.data.coverImageUrl || null,
      },
    });
  }

  await prisma.decklist.update({
    where: { id },
    data: {
      ...validated.data,
      playerName: cleanPlayerName,
      playerId: player.id,
      tournamentId: validated.data.tournamentId || null,
    },
  });

  // Recalculate player ranking points
  await recalculatePlayerPoints(player.id);

  revalidatePath("/admin/decks");
  revalidatePath("/admin/torneos");
  revalidatePath("/decks");
  revalidatePath("/recomendadas");
  revalidatePath("/torneos");
  revalidatePath("/ranking");
  revalidatePath(`/jugador/${encodeURIComponent(cleanPlayerName)}`);
  revalidatePath("/");
  return { success: true };
}

// Helper to recalculate a player's total ranking points
async function recalculatePlayerPoints(playerId: string) {
  try {
    const playerDecks = await prisma.decklist.findMany({
      where: {
        playerId,
        isRecommended: false,
        placement: { gt: 0 },
      },
    });

    let totalPoints = 0;
    for (const d of playerDecks) {
      if (d.placement === 1) totalPoints += 100;
      else if (d.placement === 2) totalPoints += 70;
      else if (d.placement === 3 || d.placement === 4) totalPoints += 40;
      else if (d.placement <= 8) totalPoints += 20;
      else totalPoints += 10;
    }

    await prisma.player.update({
      where: { id: playerId },
      data: { points: totalPoints },
    });
  } catch (err) {
    console.error("Error recalculating player points:", err);
  }
}

export async function deleteDecklist(id: string) {
  await requireAdmin();
  await prisma.decklist.delete({ where: { id } });
  revalidatePath("/admin/decks");
  revalidatePath("/decks");
  revalidatePath("/recomendadas");
  revalidatePath("/ranking");
  revalidatePath("/");
}

// --- LOCAL STORE / PARTNERS ACTIONS ---

const LocalStoreSchema = z.object({
  name: z.string().min(1, "Nombre de la tienda requerido"),
  location: z.string().min(1, "Ubicación requerida"),
  mapsUrl: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  instagramUrl: z.string().optional(),
  schedule: z.string().optional(),
  logoUrl: z.string().optional(),
});

export async function createLocalStore(formData: FormData) {
  await requireAdmin();
  const validated = LocalStoreSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    mapsUrl: formData.get("mapsUrl") || undefined,
    description: formData.get("description") || undefined,
    phone: formData.get("phone") || undefined,
    instagramUrl: formData.get("instagramUrl") || undefined,
    schedule: formData.get("schedule") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  });

  if (!validated.success) return;

  await prisma.localStore.create({ data: validated.data });
  revalidatePath("/admin/comunidad");
  revalidatePath("/comunidad");
  revalidatePath("/");
}

export async function deleteLocalStore(id: string) {
  await requireAdmin();
  await prisma.localStore.delete({ where: { id } });
  revalidatePath("/admin/comunidad");
  revalidatePath("/comunidad");
}

// --- COMMUNITY GROUPS ACTIONS ---

const CommunityGroupSchema = z.object({
  name: z.string().min(1, "Nombre del grupo requerido"),
  tcgName: z.string().default("GENERAL"),
  inviteUrl: z.string().min(1, "Enlace de WhatsApp requerido"),
  description: z.string().optional(),
});

export async function createCommunityGroup(formData: FormData) {
  await requireAdmin();
  const validated = CommunityGroupSchema.safeParse({
    name: formData.get("name"),
    tcgName: formData.get("tcgName") || "GENERAL",
    inviteUrl: formData.get("inviteUrl"),
    description: formData.get("description") || undefined,
  });

  if (!validated.success) return;

  await prisma.communityGroup.create({ data: validated.data });
  revalidatePath("/admin/comunidad");
  revalidatePath("/comunidad");
  revalidatePath("/");
}

export async function deleteCommunityGroup(id: string) {
  await requireAdmin();
  await prisma.communityGroup.delete({ where: { id } });
  revalidatePath("/admin/comunidad");
  revalidatePath("/comunidad");
}

// --- OFFICIAL SOCIAL LINKS ACTIONS ---

export async function updateSiteSocials(formData: FormData) {
  await requireAdmin();
  const keys = [
    "instagram_url",
    "tiktok_url",
    "discord_url",
    "youtube_url",
    "whatsapp_group_url",
    "whatsapp_number",
  ];

  for (const key of keys) {
    const val = formData.get(key);
    if (typeof val === "string") {
      await prisma.siteConfig.upsert({
        where: { key },
        update: { value: val.trim() },
        create: { key, value: val.trim() },
      });
    }
  }

  revalidatePath("/admin/comunidad");
  revalidatePath("/comunidad");
  revalidatePath("/");
}


