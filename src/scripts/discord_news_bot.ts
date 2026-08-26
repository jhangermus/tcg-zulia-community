/**
 * Zulia TCG Discord News Bot
 * --------------------------
 * Escucha el canal de leaks en Discord y publica automáticamente en zuliatcg.com
 *
 * Uso:
 *   npm run discord:bot
 *
 * Variables de entorno (.env):
 *   DISCORD_BOT_TOKEN           - Token del bot de Discord
 *   DISCORD_LEAKS_CHANNEL_IDS   - ID(s) del canal separados por coma
 *   AUTO_POST_URL               - URL del endpoint (default: https://zuliatcg.com/api/news/auto-post)
 *   AUTO_POST_SECRET            - Clave secreta del endpoint
 */

import { Client, GatewayIntentBits, Message, TextChannel } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

// ─── Configuración ────────────────────────────────────────────────────────────
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const TARGET_CHANNEL_IDS = (process.env.DISCORD_LEAKS_CHANNEL_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const API_URL = process.env.AUTO_POST_URL || "https://zuliatcg.com/api/news/auto-post";
const API_SECRET = process.env.AUTO_POST_SECRET || "zulia-tcg-auto-news-secret-2024";

if (!DISCORD_BOT_TOKEN) {
  console.error("❌ ERROR: Falta DISCORD_BOT_TOKEN en el .env");
  process.exit(1);
}

// ─── Cliente Discord ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ─── Detección de TCG por nombre de canal o contenido ─────────────────────────
function detectTcg(channelName: string, text: string): string {
  const ch = channelName.toLowerCase();
  const tx = text.toLowerCase();
  if (ch.includes("yugioh") || ch.includes("yugi") || tx.includes("yu-gi-oh")) return "yugioh";
  if (ch.includes("one-piece") || ch.includes("onepiece") || tx.includes("one piece")) return "one-piece";
  return "digimon"; // default
}

// ─── Extraer imagen de un mensaje ─────────────────────────────────────────────
function extractImage(message: Message): string | null {
  if (message.attachments.size > 0) {
    const att = message.attachments.first();
    if (att?.url) return att.url;
  }
  if (message.embeds.length > 0) {
    const embed = message.embeds[0];
    return embed.image?.url || embed.thumbnail?.url || null;
  }
  return null;
}

// ─── Publicar en la web de Zulia TCG ──────────────────────────────────────────
async function publishToWeb(payload: {
  title: string;
  content: string;
  imageUrl: string | null;
  tcgSlug: string;
  sourceUrl?: string;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: API_SECRET,
      tag: "LEAKS & REVEALS",
      sourceName: "Discord Official (#leaks-and-reveals)",
      ...payload,
    }),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    data = { error: `Respuesta no-JSON del servidor (${res.status}): ${text.slice(0, 100)}` };
  }
  return { ok: res.ok, data };
}

// ─── Procesar un mensaje de Discord ───────────────────────────────────────────
async function processMessage(message: Message, channel: TextChannel, label = "LIVE") {
  const rawText = (message.content || "").trim();
  const imageUrl = extractImage(message);

  // Ignorar si no tiene ni texto ni imagen
  if (!rawText && !imageUrl) return;

  const channelName = channel.name;
  const tcgSlug = detectTcg(channelName, rawText);

  // Construir título y contenido
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || `Nuevo Reveal de ${tcgSlug.toUpperCase()} TCG`;
  if (title.length > 130) title = title.slice(0, 127) + "...";
  const content = lines.join("\n\n") || "Carta revelada oficialmente.";

  console.log(`\n[${label}] 📢 ${channelName} → ${title}`);
  console.log(`       🖼️ Imagen: ${imageUrl ? "Sí" : "No"} | TCG: ${tcgSlug.toUpperCase()}`);

  const { ok, data } = await publishToWeb({
    title,
    content,
    imageUrl,
    tcgSlug,
    sourceUrl: message.url,
  });

  if (ok) {
    console.log(`       ✅ Publicado en web: ${data.title || title} (ID: ${data.newsId})`);
  } else if (data?.message?.includes("duplicado") || data?.message?.includes("omitido")) {
    console.log(`       ℹ️ Ya existía: omitido`);
  } else {
    console.warn(`       ⚠️ Error API:`, data);
  }
}

// ─── Evento: Bot listo ────────────────────────────────────────────────────────
client.once("clientReady", async (c) => {
  console.log("====================================================");
  console.log(`🤖 Zulia TCG News Bot conectado como: ${c.user.tag}`);
  console.log(`📡 Canales monitoreados: ${TARGET_CHANNEL_IDS.join(", ")}`);
  console.log(`🌐 Publicando en: ${API_URL}`);
  console.log("====================================================\n");

  // Sincronizar los últimos mensajes del canal al arrancar
  for (const channelId of TARGET_CHANNEL_IDS) {
    try {
      const ch = await client.channels.fetch(channelId);
      if (!ch || !ch.isTextBased()) {
        console.warn(`⚠️ Canal ${channelId} no encontrado o no es de texto`);
        continue;
      }
      const textCh = ch as TextChannel;
      console.log(`🔄 Sincronizando últimos mensajes de #${textCh.name}...`);
      const msgs = await textCh.messages.fetch({ limit: 5 });
      const sorted = Array.from(msgs.values()).reverse();
      for (const msg of sorted) {
        if (msg.author.id !== client.user?.id && !msg.author.bot) {
          await processMessage(msg, textCh, "SYNC");
        }
      }
    } catch (e: any) {
      console.error(`❌ Error al acceder al canal ${channelId}: ${e.message}`);
    }
  }

  console.log("\n👂 Escuchando en tiempo real para nuevos leaks...\n");
});

// ─── Evento: Nuevo mensaje ────────────────────────────────────────────────────
client.on("messageCreate", async (message: Message) => {
  if (message.author.id === client.user?.id) return;
  if (message.author.bot) return; // Ignorar otros bots (bots de niveles, etc.)
  if (!TARGET_CHANNEL_IDS.includes(message.channel.id)) return;
  if (!message.channel.isTextBased()) return;

  await processMessage(message, message.channel as TextChannel, "LIVE");
});

// ─── Login ─────────────────────────────────────────────────────────────────────
client.login(DISCORD_BOT_TOKEN).catch((err) => {
  console.error("❌ Error al autenticar con Discord:", err);
  process.exit(1);
});
