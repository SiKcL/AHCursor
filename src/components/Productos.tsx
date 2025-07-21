'use client'

import React, { useState } from 'react'
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
  imageUrl?: string;
  stock: number;
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
  // Eliminar la función handleAddToCart y su estado relacionado (showToast, setShowToast, useEffect) ya que ya no se usa.

 
  // Eliminar lógica de slider y usar grid
  if (productosMapeados.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {productosMapeados.map((producto) => (
          <div 
            key={producto.id} 
            className="group"
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col relative">
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
                <p className="text-sm text-gray-500 mt-1">Stock: {producto.stock}</p>
                </div>
                {producto.stock > 0 ? (
                  <button
                    className="mt-3 w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition"
                    onClick={() => addToCart({
                      id: producto.id,
                      nombre: producto.nombre,
                      precio: producto.precio,
                      precioBase: producto.precio,
                      imageUrl: producto.imageUrl || producto.imagen || '',
                      stock: producto.stock,
                    })}
                  >
                    Añadir al carrito
                  </button>
                ) : (
                  <button
                    className="mt-3 w-full bg-red-600 text-white py-2 rounded font-semibold cursor-not-allowed opacity-80"
                    disabled
                  >
                    Producto sin Stock
                  </button>
                )}
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