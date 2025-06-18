// src/components/Producto.tsx
'use client'

import React, { useState } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import Image from 'next/image'
import { Decimal } from '@prisma/client/runtime/library'
import ProductoModal from './ProductoModal' // Importamos nuestro modal

// ... (La interfaz 'Producto' y la función 'formatPrice' no cambian) ...
interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: Decimal | number;
  imageUrl: string | null;
}
const formatPrice = (price: Decimal | number) => {
  const numericPrice = typeof price === 'number' ? price : price.toNumber();
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numericPrice);
};


export default function ProductoSlider({ productos }: { productos: Producto[] }) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Ajustamos la configuración del slider para un look de galería
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false, // El loop a veces se siente menos como una "galería"
    mode: "free-snap",
    slides: {
      perView: 2, // Menos slides a la vez en móvil para que sean más grandes
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
  

  if (productos.length === 0) return null;

  return (
    <>
      <div ref={sliderRef} className="keen-slider">
        {productos.map((producto) => (
          <div 
            key={producto.id} 
            className="keen-slider__slide group" // Simplificamos la tarjeta base
            onClick={() => setProductoSeleccionado(producto)}
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              {/* Contenedor de la imagen con aspect ratio para que no se deforme */}
              <div className="relative w-full aspect-[4/5] bg-gray-100"> 
                <Image
                  src={producto.imageUrl || '/placeholder.png'}
                  alt={`Imagen de ${producto.nombre}`}
                  fill
                  className="object-cover" // object-cover se ve bien en la tarjeta
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-md font-semibold text-gray-800">{producto.nombre}</h3>
                <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(producto.precio)}</p>
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