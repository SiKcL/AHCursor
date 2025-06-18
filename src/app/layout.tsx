// src/app/layout.tsx

import type { Metadata } from "next";
// 1. Importamos la fuente 'Inter' de Google Fonts, la estándar de Next.js
import { Inter } from "next/font/google"; 
import { avigea } from "@/lib/fonts"; // Importamos tu fuente personalizada
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 

// Instanciamos Inter y le asignamos una variable CSS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Agricola Horizonte",
  description: "Productos Agricolas saludables, sustentables y hechos con amor desde la tierra chilena.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* 2. Aplicamos la variable de Inter y la de Avigea */}
      <body className={`${inter.variable} ${avigea.variable} font-sans antialiased bg-green-50 text-gray-900 flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
