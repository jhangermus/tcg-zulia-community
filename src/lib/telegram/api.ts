const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface SendMessageOptions {
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: {
    inline_keyboard?: InlineKeyboardButton[][];
    keyboard?: { text: string }[][];
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    remove_keyboard?: boolean;
  };
}

/** Enviar mensaje de texto a un chat de Telegram */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options: SendMessageOptions = {}
) {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return null;
  }

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || "HTML",
        reply_markup: options.reply_markup,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error sending telegram message:", error);
    return null;
  }
}

/** Enviar foto a un chat de Telegram */
export async function sendTelegramPhoto(
  chatId: number | string,
  photoUrl: string,
  caption?: string,
  options: SendMessageOptions = {}
) {
  if (!BOT_TOKEN) return null;

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: options.parse_mode || "HTML",
        reply_markup: options.reply_markup,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error sending telegram photo:", error);
    return null;
  }
}

/** Responder a una pulsación de botón inline (Callback Query) */
export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  if (!BOT_TOKEN) return null;

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error answering callback query:", error);
    return null;
  }
}

/** Obtener la URL pública o convertir a Data URI una foto enviada a Telegram */
export async function getTelegramFileAsDataUri(fileId: string): Promise<string | null> {
  if (!BOT_TOKEN) return null;

  try {
    // 1. Obtener la ruta del archivo
    const fileRes = await fetch(`${TELEGRAM_API_BASE}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) return null;

    const filePath = fileData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // 2. Descargar y convertir a Base64 Data URI
    const imgRes = await fetch(downloadUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Error downloading file from Telegram:", error);
    return null;
  }
}

/** Configurar Webhook de Telegram */
export async function setTelegramWebhook(webhookUrl: string) {
  if (!BOT_TOKEN) return { error: "No token" };

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error setting telegram webhook:", error);
    return { error: String(error) };
  }
}

/** Obtener info del webhook actual */
export async function getTelegramWebhookInfo() {
  if (!BOT_TOKEN) return null;
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/getWebhookInfo`);
    return await res.json();
  } catch (error) {
    return null;
  }
}
