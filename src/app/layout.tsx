// src/app/layout.tsx

import type { Metadata } from "next";

import { Inter } from "next/font/google"; 
import { avigea } from "@/lib/fonts";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 

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
      <body className={`${inter.variable} ${avigea.variable} font-sans antialiased bg-green-50 text-gray-900 flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
