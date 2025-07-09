"use client";
import { useState } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";
import CartModal from "./CartModal";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();

  return (
    <header
      className="w-full px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50 bg-white"
      style={{ color: "var(--foreground)" }}
    >
      <Link href={"/"} className="flex items-center gap-3">
      <Image
        src="/logo2.png"
        alt="Agrícola Horizonte Logo header"
        width={80}
        height={100}
        className="rounded-full"
      />
      </Link>
      
      <div className="text-2xl font-bold font-avigea" style={{ color: "var(--primary)" }}>
        <Link href={"/"}>Agrícola Horizonte</Link>
      </div>

      <nav className="hidden md:flex gap-6 text-sm font-medium">
      <Link href="/nosotros" className="hover:text-[color:var(--secondary)]">
        Nosotros
      </Link>
      <Link href="/productos" className="hover:text-[color:var(--secondary)]">
        Productos
      </Link>
      <Link href="/galeria" className="hover:text-[color:var(--secondary)]">
        Galería
      </Link>
      <Link href="/preguntas" className="hover:text-[color:var(--secondary)]">
        Preguntas Frecuentes
      </Link>
      </nav>

      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer" onClick={() => setCartOpen(true)}>
          <FaShoppingCart size={26} className="text-blue-700 hover:text-blue-900 transition" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {cart.reduce((sum, p) => sum + p.cantidad, 0)}
            </span>
          )}
        </div>
        <a href="#" className="hover:text-[color:var(--accent)]"><FaWhatsapp size={20} /></a>
        <a href="https://www.facebook.com/AgricolaHorizonte.m/" className="hover:text-[color:var(--accent)]"><FaFacebookF size={20} /></a>
        <a href="https://www.instagram.com/agricolahorizonte.m/" className="hover:text-[color:var(--accent)]"><FaInstagram size={20} /></a>
      </div>

      

      {/* Mobile menu toggle */}
      <button
        className="md:hidden"
        onClick={() => setShowMenu(!showMenu)}
      >
        ☰
      </button>

      {/* Mobile menu */}
      {showMenu && (
        <div className="absolute top-full left-0 w-full bg-white flex flex-col items-start p-6 gap-4 shadow-md">
          <Link href="/nosotros" className="hover:text-[color:var(--secondary)]">
        Nosotros
      </Link>
      <Link href="/productos" className="hover:text-[color:var(--secondary)]">
        Productos
      </Link>
      <Link href="/galeria" className="hover:text-[color:var(--secondary)]">
        Galería
      </Link>
      <Link href="/preguntas" className="hover:text-[color:var(--secondary)]">
        Preguntas Frecuentes
      </Link>
        </div>
      )}
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

  