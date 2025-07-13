// src/app/layout.tsx

import type { Metadata } from "next";

import { Inter } from "next/font/google"; 
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 
import { CartProvider } from "@/components/CartContext";
import { avigea } from "@/lib/fonts";
import Script from "next/script";
import WhatsappFloat from "@/components/WhatsappFloat";
import { AuthProvider } from "@/components/AuthContext";

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
        <AuthProvider>
          <CartProvider>
            {/* SDK de Facebook solo una vez para toda la app */}
            <div id="fb-root" />
            <Script
              id="facebook-sdk"
              strategy="afterInteractive"
              src="https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0"
              crossOrigin="anonymous"
            />
            <Header />
            {children}
            <Footer />
            <WhatsappFloat />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
