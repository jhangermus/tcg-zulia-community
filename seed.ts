import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@zuliatchg.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "admin@zuliatchg.com",
      password: hashedPassword,
      name: "Administrador Zulia TCG",
      role: "ADMIN",
    },
  });

  console.log("✅ Usuario Admin listo:", admin.email);

  // Seed default TCGs
  const defaultTcgs = [
    { name: "Yu-Gi-Oh!", slug: "yugioh", status: "ACTIVE", color: "#ef4444" },
    { name: "One Piece", slug: "one-piece", status: "ACTIVE", color: "#8b5cf6" },
    { name: "Digimon", slug: "digimon", status: "ACTIVE", color: "#3b82f6" },
  ];

  for (const tcg of defaultTcgs) {
    await prisma.tcg.upsert({
      where: { slug: tcg.slug },
      update: {},
      create: tcg,
    });
    console.log("✅ TCG registrado:", tcg.name);
  }

  // Seed a sample tournament
  const ygo = await prisma.tcg.findUnique({ where: { slug: "yugioh" } });
  if (ygo) {
    const tournament = await prisma.tournament.create({
      data: {
        name: "Copa Zulia #09",
        date: new Date("2026-06-02T10:00:00Z"),
        location: "Maracaibo, Zulia",
        prize: "$7.000",
        participantsCount: 64,
        status: "UPCOMING",
        tcgId: ygo.id,
      },
    });
    console.log("✅ Torneo de prueba creado:", tournament.name);
  }

  // Seed sample news
  await prisma.news.createMany({
    data: [
      {
        title: "Copa Zulia #08 - Gran Éxito",
        content: "Revive los mejores momentos del torneo con 64 jugadores en Maracaibo.",
        tag: "RESULTADOS",
        published: true,
      },
      {
        title: "Snake-Eye: Análisis del Mazo Campeón",
        content: "Deck profile del ganador Jhanger U. y su estrategia invicta.",
        tag: "DECK PROFILE",
        published: true,
      },
      {
        title: "Comunidad One Piece en Crecimiento",
        content: "Cada vez más capitanes se unen a las tardes de juego en Zulia.",
        tag: "COMUNIDAD",
        published: true,
      },
    ],
  });
  console.log("✅ Noticias iniciales creadas");

  console.log("\n🎉 ¡Base de datos inicializada con éxito!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Credenciales de Acceso al Panel Admin:");
  console.log("   URL:      http://localhost:3000/admin/login");
  console.log("   Email:    admin@zuliatchg.com");
  console.log("   Password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
