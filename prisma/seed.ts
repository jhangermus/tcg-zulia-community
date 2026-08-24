import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create initial admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@zuliatchg.com" },
    update: {},
    create: {
      email: "admin@zuliatchg.com",
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Seed initial TCGs
  const tcgs = [
    { name: "Yu-Gi-Oh!", slug: "yugioh", status: "ACTIVE", color: "#ef4444" },
    { name: "One Piece", slug: "one-piece", status: "ACTIVE", color: "#8b5cf6" },
    { name: "Digimon", slug: "digimon", status: "ACTIVE", color: "#3b82f6" },
  ];

  for (const tcg of tcgs) {
    await prisma.tcg.upsert({
      where: { slug: tcg.slug },
      update: {},
      create: tcg,
    });
    console.log("✅ TCG seeded:", tcg.name);
  }

  console.log("\n🎉 Seed complete!");
  console.log("📧 Admin email: admin@zuliatchg.com");
  console.log("🔑 Admin password: admin123");
  console.log("⚠️  Please change the password after first login!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
