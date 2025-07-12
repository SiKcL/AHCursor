// src/app/layout.tsx

import type { Metadata } from "next";

import { Inter } from "next/font/google"; 
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 
import { CartProvider } from "@/components/CartContext";
import { avigea } from "@/lib/fonts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Agricola Horizonte",
  description: "Productos Agricolas saludables, sustentables y hechos con amor desde la tierra chilena.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className + " " + avigea.variable}>
        <CartProvider>
        <Header />
        <main className="flex-grow w-full">{children}</main>
        <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
