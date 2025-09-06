"use client";

import { useEffect, useState } from 'react';
import ProductoSlider from '@/components/Productos';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria?: string;
  precio: number;
  imagen?: string | null;
  stock: number;
  descuentos?: { tipo: 'general' | 'por_cantidad', items: { min: number, precio?: number; porcentaje?: number }[] } | null;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [productoAgregado, setProductoAgregado] = useState<string>('');

  useEffect(() => {
    async function fetchProductos() {
      setCargando(true);
      const res = await fetch('/api/productos');
      const data = await res.json();
      setProductos(data);
      setProductosFiltrados(data);
      setCargando(false);
    }
    fetchProductos();
  }, []);

  // Filtrar productos cuando cambie el término de búsqueda
  useEffect(() => {
    if (terminoBusqueda.trim() === '') {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.categoria?.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  }, [terminoBusqueda, productos]);

  // Función para mostrar la notificación
  const mostrarNotificacionProducto = (nombreProducto: string) => {
    setProductoAgregado(nombreProducto);
    setMostrarNotificacion(true);
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setMostrarNotificacion(false);
    }, 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Notificación de producto agregado */}
      {mostrarNotificacion && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Producto Agregado</span>
            <span className="text-green-200">- {productoAgregado}</span>
          </div>
        </div>
      )}

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
          {/* Barra de búsqueda */}
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos por nombre"
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {terminoBusqueda && (
                  <button
                    onClick={() => setTerminoBusqueda('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {terminoBusqueda && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {cargando ? (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : productosFiltrados.length > 0 ? (
            <ProductoSlider 
              productos={productosFiltrados} 
              onProductoAgregado={mostrarNotificacionProducto}
            />
          ) : terminoBusqueda ? (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600">No se encontraron productos que coincidan con &quot;{terminoBusqueda}&quot;</p>
              <button
                onClick={() => setTerminoBusqueda('')}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600">No hay productos disponibles en este momento. ¡Vuelve pronto!</p>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}