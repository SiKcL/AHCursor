'use client'

import React, { useState } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import Image from 'next/image'
import ProductoModal from './ProductoModal' 
import { useCart } from './CartContext';


interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen?: string | null;
  imageUrl?: string | null;
}
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};


export default function ProductoSlider({ productos }: { productos: Producto[] }) {
  // Mapear productos para que usen imageUrl
  const productosMapeados = productos.map((p) => ({
    ...p,
    imageUrl: p.imageUrl || p.imagen || '',
  }));
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const { addToCart } = useCart();
  // Eliminar lógica de favoritos

 
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "free-snap",
    slides: {
      perView: 2, 
      spacing: 15,
    },
    breakpoints: {
      '(min-width: 768px)': {
        slides: { perView: 3, spacing: 20 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 4, spacing: 25 },
      },
    },
  });
  

  if (productosMapeados.length === 0) return null;

  return (
    <>
      <div ref={sliderRef} className="keen-slider">
        {productosMapeados.map((producto) => (
          <div 
            key={producto.id} 
            className="keen-slider__slide group"
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col relative">
              {/* Quitar estrella de favorito */}
              {/* Contenedor de la imagen con aspect ratio para que no se deforme */}
              <div className="relative w-full aspect-[4/5] bg-gray-100" onClick={() => setProductoSeleccionado(producto)}>
                <Image
                  src={producto.imageUrl || '/placeholder.png'}
                  alt={`Imagen de ${producto.nombre}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-center flex-1 flex flex-col justify-between">
                <div>
                <h3 className="text-md font-semibold text-gray-800">{producto.nombre}</h3>
                <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(producto.precio)}</p>
                </div>
                <button
                  className="mt-3 w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition"
                  onClick={() => addToCart({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imageUrl: producto.imageUrl || '',
                  })}
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productoSeleccionado && (
        <ProductoModal 
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
        />
      )}
    </>
  )
}