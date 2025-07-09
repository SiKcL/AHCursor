"use client";

import { useEffect, useState } from 'react';
import ProductoSlider from '@/components/Productos';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchProductos() {
      setCargando(true);
      const res = await fetch('/api/productos');
      const data = await res.json();
      setProductos(data);
      setCargando(false);
    }
    fetchProductos();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Sección de encabezado con video de fondo */}
      <section className="relative w-full flex items-center justify-center bg-green-100 text-center py-20 md:py-32 lg:py-48 overflow-hidden min-h-[400px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/fondoproductos.mp4"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Nuestros Productos 🥗
          </h1>
          <p className="mt-4 text-gray-200 text-lg md:text-xl max-w-xl mx-auto">
            Frescura y Calidad del campo directamente a tu mesa.
          </p>
        </div>
      </section>

      <main className="w-full py-12 md:py-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cargando ? (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : productos.length > 0 ? (
            <ProductoSlider productos={productos} />
          ) : (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600">No hay productos disponibles en este momento. ¡Vuelve pronto!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}