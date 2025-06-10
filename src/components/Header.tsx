"use client";

import { useState } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);

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
      
      <div className="text-2xl font-bold !font-avigea" style={{ color: "var(--primary)" }}>
        <Link href={"/"}>Agrícola Horizonte</Link>
      </div>

      <nav className="hidden md:flex gap-6 text-sm font-medium">
      <Link href="/nosotros" className="hover:text-[color:var(--secondary)]">
        Nosotros
      </Link>
      <Link href="#" className="hover:text-[color:var(--secondary)]">
        Productos
      </Link>
      <Link href="/galeria" className="hover:text-[color:var(--secondary)]">
        Galería
      </Link>
      <Link href="/preguntas-frecuentes" className="hover:text-[color:var(--secondary)]">
        Preguntas Frecuentes
      </Link>
      </nav>

      <div className="hidden md:flex gap-4">
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
          <a href="#">Nosotros</a>
          <a href="#">Productos</a>
          <a href="#">Galería</a>
          <a href="#">Preguntas Frecuentes</a> 
        </div>
      )}
    </header>
  );
}

  