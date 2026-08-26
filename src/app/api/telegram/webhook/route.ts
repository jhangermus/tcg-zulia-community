import { NextRequest, NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/botHandler";
import { setTelegramWebhook, getTelegramWebhookInfo } from "@/lib/telegram/api";

export const dynamic = "force-dynamic";

/** POST: Recibe actualizaciones del Webhook de Telegram */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    // Procesar update de forma asíncrona pero segura
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error handling Telegram webhook POST:", error);
    // Siempre responder 200 OK a Telegram para evitar reintentos innecesarios
    return NextResponse.json({ ok: false, error: String(error) }, { status: 200 });
  }
}

/** GET: Consultar o registrar el Webhook */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  if (action === "set") {
    const result = await setTelegramWebhook(webhookUrl);
    return NextResponse.json({
      message: "Configuración de Webhook enviada a Telegram",
      targetUrl: webhookUrl,
      result,
    });
  }

  const info = await getTelegramWebhookInfo();
  return NextResponse.json({
    status: "Telegram Webhook Endpoint Activo",
    expectedWebhookUrl: webhookUrl,
    telegramWebhookInfo: info,
  });
}
