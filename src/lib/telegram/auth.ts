import { prisma } from "@/lib/prisma";

const SUPERADMIN_ID = process.env.TELEGRAM_SUPERADMIN_ID || "798260230";

/** Verifica si un ID de Telegram está autorizado como Administrador */
export async function isAuthorizedAdmin(telegramId: string | number): Promise<{
  authorized: boolean;
  isSuperAdmin: boolean;
  name: string;
}> {
  const tid = String(telegramId).trim();

  // El SuperAdmin principal (Jhanger) siempre está autorizado
  if (tid === SUPERADMIN_ID) {
    // Asegurar que exista en la tabla TelegramAdmin
    try {
      await prisma.telegramAdmin.upsert({
        where: { telegramId: tid },
        update: { isActive: true, role: "SUPERADMIN" },
        create: {
          telegramId: tid,
          name: "Jhanger Manuel (SuperAdmin)",
          role: "SUPERADMIN",
          isActive: true,
        },
      });
    } catch (e) {
      console.error("Error upserting superadmin in TelegramAdmin:", e);
    }
    return { authorized: true, isSuperAdmin: true, name: "Jhanger Manuel" };
  }

  // Consultar en la base de datos
  try {
    const admin = await prisma.telegramAdmin.findUnique({
      where: { telegramId: tid },
    });

    if (admin && admin.isActive) {
      return {
        authorized: true,
        isSuperAdmin: admin.role === "SUPERADMIN",
        name: admin.name,
      };
    }
  } catch (error) {
    console.error("Error checking TelegramAdmin authorization:", error);
  }

  return { authorized: false, isSuperAdmin: false, name: "Usuario No Autorizado" };
}

/** Agregar un nuevo Administrador autorizado */
export async function addTelegramAdmin(telegramId: string, name: string, username?: string) {
  const tid = String(telegramId).trim();
  return await prisma.telegramAdmin.upsert({
    where: { telegramId: tid },
    update: { name, username: username || null, isActive: true },
    create: {
      telegramId: tid,
      name,
      username: username || null,
      role: "ADMIN",
      isActive: true,
    },
  });
}

/** Revocar acceso de un Administrador */
export async function removeTelegramAdmin(telegramId: string) {
  const tid = String(telegramId).trim();
  if (tid === SUPERADMIN_ID) {
    throw new Error("No puedes eliminar al SuperAdmin principal.");
  }
  return await prisma.telegramAdmin.update({
    where: { telegramId: tid },
    data: { isActive: false },
  });
}

/** Listar todos los Administradores registrados */
export async function listTelegramAdmins() {
  return await prisma.telegramAdmin.findMany({
    orderBy: { createdAt: "asc" },
  });
}
