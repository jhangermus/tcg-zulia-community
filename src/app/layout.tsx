import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#05080f] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
