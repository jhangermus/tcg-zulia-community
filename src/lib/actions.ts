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
  title: z.string().min(1),
  content: z.string().min(1),
  tag: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function createNews(formData: FormData) {
  await requireAdmin();
  const validated = NewsSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    tag: formData.get("tag") || "NOTICIAS",
    imageUrl: formData.get("imageUrl") || undefined,
  });

  if (!validated.success) return;

  await prisma.news.create({ data: validated.data });
  revalidatePath("/admin/noticias");
  revalidatePath("/");
}

export async function deleteNews(id: string) {
  await requireAdmin();
  await prisma.news.delete({ where: { id } });
  revalidatePath("/admin/noticias");
  revalidatePath("/");
}

export async function toggleNewsPublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.news.update({ where: { id }, data: { published } });
  revalidatePath("/admin/noticias");
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

const TournamentSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  location: z.string().optional(),
  prize: z.string().optional(),
  tcgId: z.string().min(1),
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
    tcgId: formData.get("tcgId"),
    participantsCount: formData.get("participantsCount") || 0,
    status: formData.get("status") || "UPCOMING",
  });

  if (!validated.success) return;

  const { date, ...rest } = validated.data;
  await prisma.tournament.create({ data: { ...rest, date: new Date(date) } });
  revalidatePath("/admin/torneos");
  revalidatePath("/");
}

export async function deleteTournament(id: string) {
  await requireAdmin();
  await prisma.tournament.delete({ where: { id } });
  revalidatePath("/admin/torneos");
}

// --- DECKLIST ACTIONS ---

const DecklistSchema = z.object({
  playerName: z.string().min(1, "El nombre del jugador es requerido"),
  deckName: z.string().min(1, "El nombre del deck es requerido"),
  placement: z.coerce.number().int().min(1),
  tournamentId: z.string().min(1, "Selecciona un torneo"),
  tcgId: z.string().min(1, "Selecciona un TCG"),
  deckData: z.string().min(2),
  adminNotes: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export async function createDecklist(formData: FormData) {
  await requireAdmin();
  const validated = DecklistSchema.safeParse({
    playerName: formData.get("playerName"),
    deckName: formData.get("deckName"),
    placement: formData.get("placement"),
    tournamentId: formData.get("tournamentId"),
    tcgId: formData.get("tcgId"),
    deckData: formData.get("deckData"),
    adminNotes: formData.get("adminNotes") ? String(formData.get("adminNotes")) : undefined,
    coverImageUrl: formData.get("coverImageUrl") ? String(formData.get("coverImageUrl")) : undefined,
  });

  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  await prisma.decklist.create({ data: validated.data });
  revalidatePath("/admin/decks");
  revalidatePath("/admin/torneos");
  revalidatePath("/decks");
  revalidatePath("/torneos");
  revalidatePath("/ranking");
  revalidatePath("/");
  return { success: true };
}

export async function updateDecklist(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID no proporcionado" };

  const validated = DecklistSchema.safeParse({
    playerName: formData.get("playerName"),
    deckName: formData.get("deckName"),
    placement: formData.get("placement"),
    tournamentId: formData.get("tournamentId"),
    tcgId: formData.get("tcgId"),
    deckData: formData.get("deckData"),
    adminNotes: formData.get("adminNotes") ? String(formData.get("adminNotes")) : undefined,
    coverImageUrl: formData.get("coverImageUrl") ? String(formData.get("coverImageUrl")) : undefined,
  });

  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  await prisma.decklist.update({
    where: { id },
    data: validated.data,
  });

  revalidatePath("/admin/decks");
  revalidatePath("/admin/torneos");
  revalidatePath("/decks");
  revalidatePath("/torneos");
  revalidatePath("/ranking");
  revalidatePath("/");
  return { success: true };
}

export async function deleteDecklist(id: string) {
  await requireAdmin();
  await prisma.decklist.delete({ where: { id } });
  revalidatePath("/admin/decks");
  revalidatePath("/decks");
  revalidatePath("/ranking");
  revalidatePath("/");
}

// --- LOCAL STORE / PARTNERS ACTIONS ---

const LocalStoreSchema = z.object({
  name: z.string().min(1, "Nombre de la tienda requerido"),
  location: z.string().min(1, "Ubicación requerida"),
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


