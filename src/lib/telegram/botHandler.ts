import { prisma } from "@/lib/prisma";
import {
  sendTelegramMessage,
  sendTelegramPhoto,
  answerTelegramCallbackQuery,
  getTelegramFileAsDataUri,
  InlineKeyboardButton,
} from "./api";
import {
  isAuthorizedAdmin,
  addTelegramAdmin,
  removeTelegramAdmin,
  listTelegramAdmins,
} from "./auth";
import { formatSpanishDate, formatSpanishDateFull, formatSpanishTime } from "@/lib/dateUtils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://zuliatcg.com";

/** Helper para generar slugs limpios */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 1;
  while (true) {
    const existing = await prisma.tournament.findUnique({ where: { slug } });
    if (!existing) return slug;
    suffix++;
    slug = `${slugify(base)}-${suffix}`;
  }
}

/** Procesa cualquier actualización que llegue por el Webhook de Telegram */
export async function handleTelegramUpdate(update: any) {
  // 1. Manejo de mensajes de texto o fotos
  if (update.message) {
    await handleMessage(update.message);
    return;
  }

  // 2. Manejo de clics en botones interactivos (Callback Queries)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }
}

/** Manejador de Mensajes */
async function handleMessage(msg: any) {
  const chatId = msg.chat?.id;
  const fromId = msg.from?.id;
  const fromName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ");
  const username = msg.from?.username;
  const text = (msg.text || msg.caption || "").trim();

  if (!chatId || !fromId) return;

  // Verificar autorización
  const auth = await isAuthorizedAdmin(fromId);

  // Si no está autorizado, responder con mensaje informativo y su ID
  if (!auth.authorized) {
    await sendTelegramMessage(
      chatId,
      `🔒 <b>Acceso Restringido - Zulia TCG Admin</b>\n\n` +
      `Hola <b>${fromName}</b>. Tu cuenta de Telegram aún no está autorizada para administrar el sistema.\n\n` +
      `📌 <b>Tu Telegram ID:</b> <code>${fromId}</code>\n\n` +
      `Pídele a un Administrador principal que te autorice con el siguiente comando:\n` +
      `<code>/addadmin ${fromId} ${fromName}</code>`
    );
    return;
  }

  // Verificar si el usuario tiene una sesión activa (ej. esperando que envíe una foto)
  const session = await prisma.telegramSession.findUnique({
    where: { telegramId: String(fromId) },
  });

  // Si envió una foto y tiene sesión activa
  if (msg.photo && msg.photo.length > 0 && session) {
    const bestPhoto = msg.photo[msg.photo.length - 1]; // Mayor resolución
    await handlePhotoUploadWithSession(chatId, fromId, bestPhoto.file_id, session);
    return;
  }

  // Si envió /cancelar
  if (text === "/cancelar" || text === "❌ Cancelar") {
    if (session) {
      await prisma.telegramSession.delete({ where: { telegramId: String(fromId) } });
    }
    await sendTelegramMessage(chatId, "✅ Operación cancelada. Regresando al menú principal.", {
      reply_markup: getMainKeyboard(),
    });
    return;
  }

  // --- COMANDOS PRINCIPALES ---

  // /start o /menu
  if (text.startsWith("/start") || text.startsWith("/menu") || text === "🏠 Menú Principal") {
    if (session) {
      await prisma.telegramSession.delete({ where: { telegramId: String(fromId) } });
    }
    await sendMainMenu(chatId, auth);
    return;
  }

  // /admins - Ver y gestionar administradores
  if (text.startsWith("/admins") || text === "⚙️ Administradores") {
    await sendAdminsList(chatId, auth);
    return;
  }

  // /addadmin <id> <nombre>
  if (text.startsWith("/addadmin")) {
    await handleAddAdminCommand(chatId, auth, text);
    return;
  }

  // /removeadmin <id>
  if (text.startsWith("/removeadmin")) {
    await handleRemoveAdminCommand(chatId, auth, text);
    return;
  }

  // /torneos - Lista de torneos
  if (text.startsWith("/torneos") || text === "🏆 Torneos") {
    await sendTournamentsMenu(chatId);
    return;
  }

  // /crear_torneo [TCG] | [Nombre] | [Fecha] | [Lugar] | [Premio]
  if (text.startsWith("/crear_torneo")) {
    await handleQuickCreateTournament(chatId, text);
    return;
  }

  // /nuevo_torneo - Asistente
  if (text.startsWith("/nuevo_torneo") || text === "➕ Nuevo Torneo") {
    await sendNewTournamentPrompt(chatId);
    return;
  }

  // /noticias
  if (text.startsWith("/noticias") || text === "📰 Noticias") {
    await sendNewsMenu(chatId);
    return;
  }

  // /crear_noticia [Título] | [Contenido]
  if (text.startsWith("/crear_noticia") || text === "➕ Publicar Noticia") {
    if (msg.photo && msg.photo.length > 0) {
      const bestPhoto = msg.photo[msg.photo.length - 1];
      const dataUri = await getTelegramFileAsDataUri(bestPhoto.file_id);
      await handleCreateNewsWithPhoto(chatId, text, dataUri);
    } else {
      await handleQuickCreateNews(chatId, text);
    }
    return;
  }

  // /ranking - Resumen de jugadores
  if (text.startsWith("/ranking") || text === "👥 Jugadores & Ranking") {
    await sendRankingSummary(chatId);
    return;
  }

  // /help o comando no reconocido
  await sendTelegramMessage(
    chatId,
    `👋 Hola <b>${auth.name}</b>. Comandos disponibles:\n\n` +
    `🏆 <b>Torneos:</b>\n` +
    `• /torneos - Ver torneos activos y cambiar estado\n` +
    `• /nuevo_torneo - Crear nuevo torneo\n\n` +
    `📰 <b>Noticias:</b>\n` +
    `• /noticias - Ver últimas noticias\n` +
    `• /crear_noticia Título | Contenido - Publicar noticia\n\n` +
    `⚙️ <b>Administración:</b>\n` +
    `• /admins - Ver administradores autorizados\n` +
    `• /addadmin ID Nombre - Autorizar nuevo admin\n` +
    `• /removeadmin ID - Revocar acceso\n\n` +
    `🌐 <b>Web:</b> ${APP_URL}`,
    { reply_markup: getMainKeyboard() }
  );
}

/** Menú Principal con Inline Buttons */
async function sendMainMenu(chatId: number, auth: { name: string; isSuperAdmin: boolean }) {
  const keyboard: InlineKeyboardButton[][] = [
    [
      { text: "🏆 Ver Torneos", callback_data: "menu_tournaments" },
      { text: "➕ Nuevo Torneo", callback_data: "menu_new_tournament" },
    ],
    [
      { text: "📰 Noticias", callback_data: "menu_news" },
      { text: "👥 Ranking Jugadores", callback_data: "menu_ranking" },
    ],
    [
      { text: "⚙️ Administradores", callback_data: "menu_admins" },
      { text: "🌐 Abrir Web Zulia TCG", url: APP_URL },
    ],
  ];

  await sendTelegramMessage(
    chatId,
    `👑 <b>Panel de Control - Zulia TCG</b>\n` +
    `Bienvenido/a, <b>${auth.name}</b>.\n` +
    `Rol: <b>${auth.isSuperAdmin ? "SuperAdministrador" : "Administrador"}</b>\n\n` +
    `Selecciona una opción del panel:`,
    {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    }
  );
}

/** Teclado de respuesta rápida inferior (Reply Keyboard) */
function getMainKeyboard() {
  return {
    keyboard: [
      [{ text: "🏆 Torneos" }, [{ text: "➕ Nuevo Torneo" }][0]],
      [{ text: "📰 Noticias" }, [{ text: "👥 Jugadores & Ranking" }][0]],
      [{ text: "⚙️ Administradores" }, [{ text: "🏠 Menú Principal" }][0]],
    ],
    resize_keyboard: true,
  };
}

/** Manejador de Callback Queries (botones inline) */
async function handleCallbackQuery(cb: any) {
  const cbId = cb.id;
  const chatId = cb.message?.chat?.id;
  const fromId = cb.from?.id;
  const data = cb.data || "";

  if (!chatId || !fromId) return;

  const auth = await isAuthorizedAdmin(fromId);
  if (!auth.authorized) {
    await answerTelegramCallbackQuery(cbId, "⛔ No estás autorizado.", true);
    return;
  }

  // --- NAVEGACIÓN GENERAL ---
  if (data === "menu_main") {
    await answerTelegramCallbackQuery(cbId);
    await sendMainMenu(chatId, auth);
    return;
  }

  if (data === "menu_tournaments") {
    await answerTelegramCallbackQuery(cbId);
    await sendTournamentsMenu(chatId);
    return;
  }

  if (data === "menu_new_tournament") {
    await answerTelegramCallbackQuery(cbId);
    await sendNewTournamentPrompt(chatId);
    return;
  }

  if (data === "menu_admins") {
    await answerTelegramCallbackQuery(cbId);
    await sendAdminsList(chatId, auth);
    return;
  }

  if (data === "menu_news") {
    await answerTelegramCallbackQuery(cbId);
    await sendNewsMenu(chatId);
    return;
  }

  if (data === "menu_ranking") {
    await answerTelegramCallbackQuery(cbId);
    await sendRankingSummary(chatId);
    return;
  }

  // --- GESTIÓN DE TORNEOS ---

  // Ver detalle de torneo: `t_view_<id>`
  if (data.startsWith("t_view_")) {
    const tId = data.replace("t_view_", "");
    await answerTelegramCallbackQuery(cbId);
    await sendTournamentDetail(chatId, tId);
    return;
  }

  // Cambiar estado torneo: `t_status_<id>_<status>`
  if (data.startsWith("t_status_")) {
    const parts = data.split("_");
    const tId = parts[2];
    const newStatus = parts[3]; // UPCOMING, ONGOING, COMPLETED

    await prisma.tournament.update({
      where: { id: tId },
      data: { status: newStatus },
    });

    await answerTelegramCallbackQuery(cbId, `Estado actualizado a ${newStatus}`);
    await sendTournamentDetail(chatId, tId);
    return;
  }

  // Subir foto podio: `t_podium_<id>`
  if (data.startsWith("t_podium_")) {
    const tId = data.replace("t_podium_", "");
    await prisma.telegramSession.upsert({
      where: { telegramId: String(fromId) },
      update: { step: "AWAITING_PODIUM_PHOTO", data: JSON.stringify({ tournamentId: tId }) },
      create: { telegramId: String(fromId), step: "AWAITING_PODIUM_PHOTO", data: JSON.stringify({ tournamentId: tId }) },
    });

    await answerTelegramCallbackQuery(cbId);
    await sendTelegramMessage(
      chatId,
      `📷 <b>Sube la Foto del Podio / Campeón</b>\n\n` +
      `Envía la foto tomada en la tienda como imagen a este chat.\n` +
      `Se actualizará de inmediato en la tarjeta del torneo y en la portada.\n\n` +
      `<i>Escribe /cancelar para anular.</i>`
    );
    return;
  }

  // Subir banner: `t_banner_<id>`
  if (data.startsWith("t_banner_")) {
    const tId = data.replace("t_banner_", "");
    await prisma.telegramSession.upsert({
      where: { telegramId: String(fromId) },
      update: { step: "AWAITING_BANNER_PHOTO", data: JSON.stringify({ tournamentId: tId }) },
      create: { telegramId: String(fromId), step: "AWAITING_BANNER_PHOTO", data: JSON.stringify({ tournamentId: tId }) },
    });

    await answerTelegramCallbackQuery(cbId);
    await sendTelegramMessage(
      chatId,
      `🖼️ <b>Sube la Imagen Banner del Torneo</b>\n\n` +
      `Envía el arte temático o imagen que servirá de fondo para este torneo.\n\n` +
      `<i>Escribe /cancelar para anular.</i>`
    );
    return;
  }

  // Revocar admin: `admin_remove_<id>`
  if (data.startsWith("admin_remove_")) {
    const tidToRemove = data.replace("admin_remove_", "");
    try {
      await removeTelegramAdmin(tidToRemove);
      await answerTelegramCallbackQuery(cbId, "Admin revocado correctamente", true);
      await sendAdminsList(chatId, auth);
    } catch (e: any) {
      await answerTelegramCallbackQuery(cbId, e.message || "Error al revocar", true);
    }
    return;
  }
}

/** Lista y gestión de Torneos */
async function sendTournamentsMenu(chatId: number) {
  const tournaments = await prisma.tournament.findMany({
    include: { tcg: true },
    orderBy: { date: "desc" },
    take: 8,
  });

  if (tournaments.length === 0) {
    await sendTelegramMessage(
      chatId,
      `🏆 <b>Torneos Registrados</b>\n\nNo hay torneos registrados actualmente.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ Crear Primer Torneo", callback_data: "menu_new_tournament" }],
            [{ text: "⬅️ Volver al Menú", callback_data: "menu_main" }],
          ],
        },
      }
    );
    return;
  }

  const buttons: InlineKeyboardButton[][] = tournaments.map((t) => {
    const statusIcon = t.status === "UPCOMING" ? "🔵" : t.status === "ONGOING" ? "🟡" : "🟢";
    return [
      {
        text: `${statusIcon} [${t.tcg.name}] ${t.name.slice(0, 24)}...`,
        callback_data: `t_view_${t.id}`,
      },
    ];
  });

  buttons.push([
    { text: "➕ Crear Nuevo Torneo", callback_data: "menu_new_tournament" },
    { text: "⬅️ Volver al Menú", callback_data: "menu_main" },
  ]);

  await sendTelegramMessage(
    chatId,
    `🏆 <b>Torneos en Zulia TCG (${tournaments.length})</b>\nToca cualquier torneo para ver detalles, cambiar estado o subir fotos:`,
    {
      reply_markup: {
        inline_keyboard: buttons,
      },
    }
  );
}

/** Detalle de un Torneo específico con acciones interactivas */
async function sendTournamentDetail(chatId: number, tournamentId: string) {
  const t = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { tcg: true, decklists: { orderBy: { placement: "asc" } } },
  });

  if (!t) {
    await sendTelegramMessage(chatId, "❌ Torneo no encontrado.");
    return;
  }

  const statusText =
    t.status === "UPCOMING" ? "🔵 Próximo" : t.status === "ONGOING" ? "🟡 En Juego" : "🟢 Finalizado";

  const top1 = t.decklists.find((d) => d.placement === 1);
  const webLink = `${APP_URL}/torneos/${t.slug || t.id}`;

  const message =
    `🏆 <b>${t.name}</b>\n\n` +
    `🎮 <b>TCG:</b> ${t.tcg.name}\n` +
    `📅 <b>Fecha:</b> ${formatSpanishDateFull(t.date)}\n` +
    `⏰ <b>Hora:</b> ${formatSpanishTime(t.date)}\n` +
    `📍 <b>Sede:</b> ${t.location || "Maracaibo, Zulia"}\n` +
    `🎁 <b>Premio:</b> ${t.prize || "Por definir"}\n` +
    `👥 <b>Cupo:</b> ${t.participantsCount > 0 ? `${t.participantsCount} duelistas` : "Abierto"}\n` +
    `📊 <b>Estado Actual:</b> <b>${statusText}</b>\n` +
    (top1 ? `👑 <b>Campeón:</b> ${top1.playerName}\n` : "") +
    (t.photoUrl ? `📷 <i>Tiene foto de podio cargada</i>\n` : "") +
    (t.bannerUrl ? `🖼️ <i>Tiene banner personalizado</i>\n` : "");

  const keyboard: InlineKeyboardButton[][] = [
    // Cambiar estado
    [
      { text: t.status === "UPCOMING" ? "✓ Próximo" : "🔵 Próximo", callback_data: `t_status_${t.id}_UPCOMING` },
      { text: t.status === "ONGOING" ? "✓ En Juego" : "🟡 En Juego", callback_data: `t_status_${t.id}_ONGOING` },
      { text: t.status === "COMPLETED" ? "✓ Finalizado" : "🟢 Finalizado", callback_data: `t_status_${t.id}_COMPLETED` },
    ],
    // Subir Fotos
    [
      { text: "📷 Subir Foto Podio", callback_data: `t_podium_${t.id}` },
      { text: "🖼️ Subir Banner", callback_data: `t_banner_${t.id}` },
    ],
    // Enlace público
    [
      { text: "🔗 Abrir en la Web", url: webLink },
    ],
    [
      { text: "⬅️ Volver a Lista de Torneos", callback_data: "menu_tournaments" },
    ],
  ];

  await sendTelegramMessage(chatId, message, {
    reply_markup: { inline_keyboard: keyboard },
  });
}

/** Procesar subida de foto cuando hay sesión activa */
async function handlePhotoUploadWithSession(
  chatId: number,
  fromId: number,
  fileId: string,
  session: { step: string; data: string }
) {
  const sessionData = JSON.parse(session.data || "{}");

  await sendTelegramMessage(chatId, "⏳ Descargando y procesando imagen en alta calidad...");

  const dataUri = await getTelegramFileAsDataUri(fileId);
  if (!dataUri) {
    await sendTelegramMessage(chatId, "❌ Error al procesar la imagen de Telegram. Inténtalo de nuevo.");
    return;
  }

  // Si era para Podio de Torneo
  if (session.step === "AWAITING_PODIUM_PHOTO" && sessionData.tournamentId) {
    await prisma.tournament.update({
      where: { id: sessionData.tournamentId },
      data: { photoUrl: dataUri },
    });
    await prisma.telegramSession.delete({ where: { telegramId: String(fromId) } });

    await sendTelegramMessage(chatId, "✅ <b>¡Foto del Podio / Campeón guardada con éxito!</b>");
    await sendTournamentDetail(chatId, sessionData.tournamentId);
    return;
  }

  // Si era para Banner de Torneo
  if (session.step === "AWAITING_BANNER_PHOTO" && sessionData.tournamentId) {
    await prisma.tournament.update({
      where: { id: sessionData.tournamentId },
      data: { bannerUrl: dataUri },
    });
    await prisma.telegramSession.delete({ where: { telegramId: String(fromId) } });

    await sendTelegramMessage(chatId, "✅ <b>¡Banner del Torneo actualizado con éxito!</b>");
    await sendTournamentDetail(chatId, sessionData.tournamentId);
    return;
  }
}

/** Instrucciones para nuevo torneo */
async function sendNewTournamentPrompt(chatId: number) {
  const tcgs = await prisma.tcg.findMany({ where: { status: "ACTIVE" } });
  const tcgNames = tcgs.map((t) => t.name).join(", ");

  await sendTelegramMessage(
    chatId,
    `➕ <b>Crear Nuevo Torneo (Comando Rápido)</b>\n\n` +
    `Envía un mensaje con el siguiente formato usando separador barra <code>|</code>:\n\n` +
    `<code>/crear_torneo TCG | Nombre del Torneo | Fecha (AAAA-MM-DD HH:MM) | Sede | Premio</code>\n\n` +
    `📌 <b>Ejemplo:</b>\n` +
    `<code>/crear_torneo One Piece | Torneo Avanzado Pirata | 2026-08-30 11:30 | Oracle Gaming | Reparto Top 4</code>\n\n` +
    `🎮 <i>TCGs disponibles: ${tcgNames}</i>`
  );
}

/** Crear torneo rápido a partir de texto */
async function handleQuickCreateTournament(chatId: number, text: string) {
  const payload = text.replace("/crear_torneo", "").trim();
  const parts = payload.split("|").map((p) => p.trim());

  if (parts.length < 3) {
    await sendTelegramMessage(
      chatId,
      `⚠️ <b>Formato incompleto.</b> Usa:\n` +
      `<code>/crear_torneo TCG | Nombre | AAAA-MM-DD HH:MM | Sede (opcional) | Premio (opcional)</code>`
    );
    return;
  }

  const [tcgInput, name, dateStr, location = "Maracaibo, Zulia", prize = "Reparto al Top"] = parts;

  // Buscar TCG
  const tcg = await prisma.tcg.findFirst({
    where: {
      OR: [
        { name: { contains: tcgInput, mode: "insensitive" } },
        { slug: { contains: tcgInput.toLowerCase() } },
      ],
    },
  });

  if (!tcg) {
    await sendTelegramMessage(chatId, `❌ No se encontró el TCG "<b>${tcgInput}</b>". TCGs válidos: Yu-Gi-Oh!, One Piece, Digimon.`);
    return;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    await sendTelegramMessage(chatId, `❌ Fecha inválida "<b>${dateStr}</b>". Usa formato AAAA-MM-DD HH:MM (ejemplo: <code>2026-08-30 15:30</code>).`);
    return;
  }

  const slug = await uniqueSlug(name);

  const tournament = await prisma.tournament.create({
    data: {
      name,
      slug,
      date,
      location,
      prize,
      tcgId: tcg.id,
      status: "UPCOMING",
    },
  });

  await sendTelegramMessage(
    chatId,
    `🎉 <b>¡Torneo creado exitosamente!</b>\n\n` +
    `🏆 <b>${tournament.name}</b>\n` +
    `🎮 TCG: ${tcg.name}\n` +
    `📅 Fecha: ${formatSpanishDateFull(tournament.date)} (${formatSpanishTime(tournament.date)})\n` +
    `📍 Sede: ${tournament.location}\n` +
    `🔗 Enlace: ${APP_URL}/torneos/${tournament.slug}`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📷 Subir Foto Podio", callback_data: `t_podium_${tournament.id}` }],
          [{ text: "🖼️ Subir Banner", callback_data: `t_banner_${tournament.id}` }],
          [{ text: "⬅️ Ver Lista de Torneos", callback_data: "menu_tournaments" }],
        ],
      },
    }
  );
}

/** Menú de Administradores */
async function sendAdminsList(chatId: number, auth: { isSuperAdmin: boolean }) {
  const admins = await listTelegramAdmins();

  let text = `⚙️ <b>Administradores Autorizados de Zulia TCG (${admins.length})</b>\n\n`;
  const keyboard: InlineKeyboardButton[][] = [];

  for (const a of admins) {
    const isSuper = a.role === "SUPERADMIN";
    const status = a.isActive ? "🟢" : "🔴 Inactivo";
    text += `• ${status} <b>${a.name}</b> ${isSuper ? "👑 <i>(SuperAdmin)</i>" : ""}\n  ID: <code>${a.telegramId}</code>\n\n`;

    // Si es Superadmin, puede revocar a los que no sean él mismo
    if (auth.isSuperAdmin && !isSuper && a.isActive) {
      keyboard.push([
        { text: `❌ Revocar a ${a.name}`, callback_data: `admin_remove_${a.telegramId}` },
      ]);
    }
  }

  text += `\n📌 <b>¿Cómo autorizar a otra persona?</b>\n` +
    `1. Pídele que inicie el bot <b>@ZuliaTcgAdmin_Bot</b> en Telegram y le dará su ID.\n` +
    `2. Escribe aquí el comando:\n<code>/addadmin ID_DE_TELEGRAM Nombre</code>\n\n` +
    `<i>Ejemplo: <code>/addadmin 123456789 Carlos Pérez</code></i>`;

  keyboard.push([{ text: "⬅️ Volver al Menú", callback_data: "menu_main" }]);

  await sendTelegramMessage(chatId, text, {
    reply_markup: { inline_keyboard: keyboard },
  });
}

/** Comando /addadmin */
async function handleAddAdminCommand(
  chatId: number,
  auth: { isSuperAdmin: boolean },
  text: string
) {
  if (!auth.isSuperAdmin) {
    await sendTelegramMessage(chatId, "⛔ Solo el SuperAdministrador puede autorizar nuevos administradores.");
    return;
  }

  const parts = text.replace("/addadmin", "").trim().split(/\s+/);
  const targetId = parts[0];
  const name = parts.slice(1).join(" ");

  if (!targetId || !name) {
    await sendTelegramMessage(
      chatId,
      `⚠️ <b>Formato incorrecto.</b> Usa:\n<code>/addadmin TELEGRAM_ID Nombre Completo</code>\n\n` +
      `<i>Ejemplo: <code>/addadmin 987654321 Pedro Ramos</code></i>`
    );
    return;
  }

  await addTelegramAdmin(targetId, name);

  await sendTelegramMessage(
    chatId,
    `✅ <b>¡Administrador Autorizado con Éxito!</b>\n\n` +
    `👤 <b>Nombre:</b> ${name}\n` +
    `🆔 <b>Telegram ID:</b> <code>${targetId}</code>\n\n` +
    `Ya puede interactuar con <b>@ZuliaTcgAdmin_Bot</b> para gestionar torneos y noticias.`
  );
}

/** Comando /removeadmin */
async function handleRemoveAdminCommand(
  chatId: number,
  auth: { isSuperAdmin: boolean },
  text: string
) {
  if (!auth.isSuperAdmin) {
    await sendTelegramMessage(chatId, "⛔ Solo el SuperAdministrador puede revocar administradores.");
    return;
  }

  const targetId = text.replace("/removeadmin", "").trim();
  if (!targetId) {
    await sendTelegramMessage(chatId, `⚠️ Usa: <code>/removeadmin TELEGRAM_ID</code>`);
    return;
  }

  try {
    await removeTelegramAdmin(targetId);
    await sendTelegramMessage(chatId, `✅ Se ha revocado el acceso al ID <code>${targetId}</code>.`);
  } catch (e: any) {
    await sendTelegramMessage(chatId, `❌ ${e.message || "Error al revocar"}`);
  }
}

/** Menú y gestión de Noticias */
async function sendNewsMenu(chatId: number) {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  let text = `📰 <b>Últimas Noticias Publicadas (${news.length})</b>\n\n`;
  for (const n of news) {
    text += `• <b>${n.title}</b>\n  📅 ${formatSpanishDate(n.createdAt)} - ${n.sourceUrl ? `[${n.sourceName || "Enlace"}]` : "Oficial"}\n\n`;
  }

  text += `📌 <b>Para publicar una noticia rápida:</b>\n` +
    `1. Envía una foto con el texto: <code>Título de la Noticia | Contenido detallado</code>\n` +
    `2. O escribe: <code>/crear_noticia Título | Contenido</code>`;

  await sendTelegramMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ Volver al Menú", callback_data: "menu_main" }],
      ],
    },
  });
}

/** Crear noticia rápida */
async function handleQuickCreateNews(chatId: number, text: string) {
  const parts = text.replace("/crear_noticia", "").trim().split("|").map((p) => p.trim());
  if (parts.length < 2) {
    await sendTelegramMessage(chatId, `⚠️ Usa: <code>/crear_noticia Título de la Noticia | Contenido de la noticia</code>`);
    return;
  }

  const [title, content] = parts;
  const tcg = await prisma.tcg.findFirst({ where: { status: "ACTIVE" } });

  await prisma.news.create({
    data: {
      title,
      content,
      published: true,
      tcgSlug: tcg?.slug || "general",
      tag: "NOTICIAS",
    },
  });

  await sendTelegramMessage(chatId, `✅ <b>¡Noticia publicada con éxito en la web!</b>\n\n📰 <b>${title}</b>`);
}

/** Crear noticia con foto */
async function handleCreateNewsWithPhoto(chatId: number, text: string, imageUrl: string | null) {
  const parts = text.replace("/crear_noticia", "").trim().split("|").map((p) => p.trim());
  const title = parts[0] || "Nueva Noticia";
  const content = parts[1] || parts[0];
  const tcg = await prisma.tcg.findFirst({ where: { status: "ACTIVE" } });

  await prisma.news.create({
    data: {
      title,
      content,
      imageUrl: imageUrl || null,
      published: true,
      tcgSlug: tcg?.slug || "general",
      tag: "NOTICIAS",
    },
  });

  await sendTelegramMessage(chatId, `✅ <b>¡Noticia con imagen publicada en la web!</b>\n\n📰 <b>${title}</b>`);
}

/** Resumen de Ranking de Jugadores */
async function sendRankingSummary(chatId: number) {
  const players = await prisma.player.findMany({
    orderBy: { points: "desc" },
    take: 8,
  });

  let text = `👥 <b>Top Jugadores & Ranking Zulia TCG</b>\n\n`;
  players.forEach((p, idx) => {
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
    text += `${medal} <b>${p.name}</b> — <b>${p.points} pts</b>\n`;
  });

  text += `\n🌐 Ranking completo en: ${APP_URL}/ranking`;

  await sendTelegramMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⬅️ Volver al Menú", callback_data: "menu_main" }],
      ],
    },
  });
}
