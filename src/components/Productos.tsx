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
  descuentos?: { tipo: 'general' | 'por_cantidad', items: { min: number, porcentaje: number }[] } | null;
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
        {productosMapeados.map((producto) => {
          let badge = null;
          if (producto.descuentos) {
            if (producto.descuentos.tipo === 'general' && producto.descuentos.items.length > 0) {
              badge = (
                <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                  -{producto.descuentos.items[0].porcentaje}% Descuento
                </span>
              );
            } else if (producto.descuentos.tipo === 'por_cantidad' && producto.descuentos.items.length > 0) {
              const min = Math.min(...producto.descuentos.items.map(d => d.min));
              badge = (
                <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                  Descuentos desde {min} un.
                </span>
              );
            }
          }
          return (
            <div key={producto.id} className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col relative">
                {/* Badge de descuento */}
                {badge}
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
                    {/* Mostrar precio original tachado si hay descuento */}
                    {producto.descuentos && producto.descuentos.items.length > 0 ? (
                      <>
                        <p className="text-sm text-gray-400 line-through">{formatPrice(producto.precio)}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {(() => {
                            // Calcular el precio con descuento mínimo
                            const minDesc = Math.min(...producto.descuentos.items.map(d => d.porcentaje));
                            return formatPrice(Math.round(producto.precio * (1 - minDesc / 100)));
                          })()}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(producto.precio)}</p>
                    )}
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
                        // descuentos: producto.descuentos || null, // Quitar si CartItem no lo acepta
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
          );
        })}
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