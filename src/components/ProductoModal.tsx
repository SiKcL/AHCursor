'use client'

import React from 'react'
import Image from 'next/image'
import { useState } from 'react';
import { useCart } from './CartContext';

interface Producto {
  id?: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imageUrl: string | null;
}
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};


export default function ProductoModal({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  const [cantidad, setCantidad] = useState(1);
  const { addToCart } = useCart();
  const productoId = (producto as Producto & { id: number }).id;
  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full md:w-3/4 lg:w-2/3 max-w-4xl relative flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 bg-white/50 rounded-full p-1 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Sección de la Imagen: ahora ocupará más espacio y mostrará la imagen completa */}
        <div className="w-full md:w-1/2 p-4 flex items-center justify-center bg-gray-100">
            <div className="relative w-full h-full min-h-[400px]">
                <Image
                    src={producto.imageUrl || '/placeholder.png'}
                    alt={`Imagen de ${producto.nombre}`}
                    fill
                    className="object-contain" //
                />
            </div>
        </div>

        {/* Sección de la Descripción */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-gray-900">{producto.nombre}</h2>
            <p className="text-gray-700 mt-4 text-base leading-relaxed">
                {producto.descripcion || 'Este producto no tiene una descripción detallada.'}
            </p>
            <div className="text-4xl font-bold text-green-600 mt-8">
                {formatPrice(producto.precio)}
            </div>
            <div className="flex items-center gap-4 mt-8">
              <button
                className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
                onClick={() => {
                  addToCart({
                    id: productoId,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imageUrl: producto.imageUrl || '',
                  });
                  for (let i = 1; i < cantidad; i++) {
                    addToCart({
                      id: productoId,
                      nombre: producto.nombre,
                      precio: producto.precio,
                      imageUrl: producto.imageUrl || '',
                    });
                  }
                  onClose();
                }}
              >
                Añadir al carrito
              </button>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-blue-200 rounded text-blue-800 font-bold text-lg" onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
                <span className="px-2 text-lg">{cantidad}</span>
                <button className="px-3 py-1 bg-blue-200 rounded text-blue-800 font-bold text-lg" onClick={() => setCantidad(cantidad + 1)}>+</button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}