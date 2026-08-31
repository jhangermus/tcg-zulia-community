import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zulia TCG | Comunidad de TCG del Zulia",
  description: "Torneos, Decklists, Tops, Noticias y Comunidad de Digimon, Yu-Gi-Oh! y One Piece en Zulia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${syne.variable} antialiased bg-[#05080f] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
