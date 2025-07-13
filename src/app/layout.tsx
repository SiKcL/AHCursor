// src/app/layout.tsx

import type { Metadata } from "next";

import { Inter } from "next/font/google"; 
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 
import { CartProvider } from "@/components/CartContext";
import { avigea } from "@/lib/fonts";
import Script from "next/script";

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
        {/* SDK de Facebook solo una vez para toda la app */}
        <div id="fb-root" />
        <Script
          id="facebook-sdk"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (!window.FB) {
                (function(d, s, id) {
                  var js, fjs = d.getElementsByTagName(s)[0];
                  if (d.getElementById(id)) return;
                  js = d.createElement(s); js.id = id;
                  js.src = "https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v19.0";
                  fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
              }
            `,
          }}
        />
        <CartProvider>
        <Header />
        <main className="flex-grow w-full">{children}</main>
        <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
