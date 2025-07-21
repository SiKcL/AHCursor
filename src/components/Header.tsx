"use client";
import { useState } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";
import CartModal from "./CartModal";
import { useRouter } from "next/navigation";
import { useAuth } from './AuthContext';

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();
  const [userMenu, setUserMenu] = useState(false);
  const router = useRouter();
  const { isAuth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    router.push('/');
  };

  return (
    <header
      className="w-full px-4 py-3 flex flex-col md:flex-row md:items-center shadow-md sticky top-0 z-50 bg-white"
      style={{ color: "var(--foreground)" }}
    >
      <div className="flex flex-row items-center md:w-1/3 w-full justify-between md:justify-start">
      <Link href={"/"} className="flex items-center gap-3">
      <Image
        src="/logo2.png"
        alt="Agrícola Horizonte Logo header"
            width={60}
            height={60}
        className="rounded-full"
      />
      </Link>
        <div className="text-2xl font-bold ml-2" style={{ color: "var(--primary)", fontFamily: 'var(--font-avigea)' }}>
        <Link href={"/"}>Agrícola Horizonte</Link>
        </div>
        {/* Mobile menu toggle */}
        <button
          className="md:hidden ml-auto text-3xl px-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          ☰
        </button>
      </div>
      {/* Navegación principal al centro en md+ */}
      <nav className="hidden md:flex gap-6 text-sm font-medium justify-center md:w-1/3">
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
      {/* Iconos a la derecha en md+ */}
      <div className="flex flex-row flex-wrap items-center gap-4 mt-4 md:mt-0 md:ml-6 md:w-1/3 md:justify-end">
        <div className="relative cursor-pointer" onClick={() => setCartOpen(true)}>
          <FaShoppingCart size={26} className="text-blue-700 hover:text-blue-900 transition" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {cart.reduce((sum, p) => sum + p.cantidad, 0)}
            </span>
          )}
        </div>
        <a href="https://wa.me/56973821569" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--accent)]"><FaWhatsapp size={22} /></a>
        <a href="https://www.facebook.com/AgricolaHorizonte.m/" className="hover:text-[color:var(--accent)]"><FaFacebookF size={22} /></a>
        <a href="https://www.instagram.com/agricolahorizonte.m/" className="hover:text-[color:var(--accent)]"><FaInstagram size={22} /></a>
        {/* Icono de usuario */}
        <div className="relative">
          <button
            className="ml-2 text-blue-900 hover:text-blue-700 focus:outline-none"
            onClick={() => setUserMenu(v => !v)}
            aria-label="Menú de usuario"
          >
            <FaUserCircle size={28} />
          </button>
          {userMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 text-sm">
              {isAuth ? (
                <>
                  <Link href="/perfil" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenu(false)}>Perfil</Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenu(false)}>Iniciar sesión</Link>
                  <Link href="/registro" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setUserMenu(false)}>Registrarse</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      {showMenu && (
        <div className="absolute top-full left-0 w-full bg-white flex flex-col items-start p-6 gap-4 shadow-md z-50 border-t">
          <Link href="/nosotros" className="hover:text-[color:var(--secondary)] w-full">Nosotros</Link>
          <Link href="/productos" className="hover:text-[color:var(--secondary)] w-full">Productos</Link>
          <Link href="/galeria" className="hover:text-[color:var(--secondary)] w-full">Galería</Link>
          <Link href="/preguntas" className="hover:text-[color:var(--secondary)] w-full">Preguntas Frecuentes</Link>
        </div>
      )}
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

  