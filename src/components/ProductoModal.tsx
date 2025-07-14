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
  imagen?: string | null;
  stock?: number;
}
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

interface ProductoModalProps {
  producto: Producto;
  onClose: () => void;
}

export default function ProductoModal({ producto, onClose }: ProductoModalProps) {
  // Tipar productoMapeado correctamente y asegurar que imageUrl exista
  const productoMapeado: Producto & { imageUrl: string } = {
    ...producto,
    imageUrl: (producto as Producto & { imageUrl?: string }).imageUrl || producto.imagen || '',
  };
  const [cantidad, setCantidad] = useState(1);
  const { addToCart } = useCart();
  const productoId = (productoMapeado as Producto & { id: number }).id;

  // Eliminar lógica de favoritos
  // Tramos de descuento por volumen y porcentajes
  const DESCUENTOS = [
    { min: 200, porcentaje: 49.5 },
    { min: 160, porcentaje: 44.4 },
    { min: 100, porcentaje: 34.3 },
    { min: 50, porcentaje: 24.2 },
    { min: 25, porcentaje: 14.1 },
  ];
  const PRECIO_BASE = productoMapeado.precio;

  function getDescuentoPorcentaje(cantidad: number) {
    for (const tramo of DESCUENTOS) {
      if (cantidad >= tramo.min) return tramo.porcentaje;
    }
    return 0;
  }

  function getPrecioUnitario(cantidad: number) {
    const descuento = getDescuentoPorcentaje(cantidad);
    return Math.round(PRECIO_BASE * (1 - descuento / 100));
  }

  const precioUnitario = getPrecioUnitario(cantidad);
  const totalPagar = precioUnitario * cantidad;

  // Generar tabla de descuentos dinámica
  const tablaDescuentos = DESCUENTOS.map(tramo => {
    const precioFinal = Math.round(PRECIO_BASE * (1 - tramo.porcentaje / 100));
    return (
      <li key={tramo.min}>
        Sobre {tramo.min} un. – <span className="font-bold">{formatPrice(precioFinal)}</span> iva incl.
      </li>
    );
  });

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
                    src={productoMapeado.imageUrl || '/placeholder.png'}
                    alt={`Imagen de ${productoMapeado.nombre}`}
                    fill
                    className="object-contain" //
                />
            </div>
        </div>

        {/* Sección de la Descripción */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-4xl font-bold text-gray-900">{productoMapeado.nombre}</h2>
              {/* Quitar estrella de favorito */}
            </div>
            <p className="text-gray-700 mt-4 text-base leading-relaxed">
                {productoMapeado.descripcion || 'Este producto no tiene una descripción detallada.'}
            </p>
            <div className="text-4xl font-bold text-green-600 mt-8">
              {formatPrice(precioUnitario)} <span className="text-base font-normal text-gray-600">IVA incl.</span>
            </div>
            {typeof productoMapeado.stock === 'number' && (
              <div className="text-sm text-gray-500 mt-1">Stock: {productoMapeado.stock}</div>
            )}
            {/* Tabla de descuentos por volumen */}
            <div className="mt-4 mb-2">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-800 text-sm font-semibold mb-2">
                Este producto cuenta con descuento por volumen
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {tablaDescuentos}
              </ul>
            </div>
            {/* Selector de cantidad y total a pagar */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-gray-700 font-medium">Cantidad</span>
              <button type="button" className="bg-gray-200 px-2 rounded text-lg" onClick={() => setCantidad(c => Math.max(1, c - 1))} disabled={(productoMapeado.stock as number ?? 0) === 0 || cantidad <= 1}>-</button>
              <input
                type="number"
                min={1}
                max={(productoMapeado.stock as number ?? 0)}
                value={cantidad}
                onChange={e => {
                  let val = parseInt(e.target.value, 10);
                  if (isNaN(val) || val < 1) val = 1;
                  if ((productoMapeado.stock as number ?? 0) && val > (productoMapeado.stock as number ?? 0)) val = (productoMapeado.stock as number ?? 0);
                  setCantidad(val);
                }}
                onBlur={e => {
                  let val = parseInt(e.target.value, 10);
                  if (isNaN(val) || val < 1) val = 1;
                  if ((productoMapeado.stock as number ?? 0) && val > (productoMapeado.stock as number ?? 0)) val = (productoMapeado.stock as number ?? 0);
                  if (val !== cantidad) setCantidad(val);
                }}
                onFocus={e => e.target.select()}
                className="w-16 text-center border rounded px-2 py-1 text-lg font-bold"
                disabled={(productoMapeado.stock as number ?? 0) === 0}
              />
              <button type="button" className="bg-gray-200 px-2 rounded text-lg" onClick={() => setCantidad(c => Math.min((productoMapeado.stock as number ?? 0), c + 1))} disabled={(productoMapeado.stock as number ?? 0) === 0 || cantidad >= (productoMapeado.stock as number ?? 0)}>+</button>
            </div>
            <div className="mt-2 text-green-700 font-bold text-lg">
              A pagar: {formatPrice(totalPagar)}
            </div>
            {(productoMapeado.stock as number ?? 0) > 0 ? (
              <div className="flex items-center gap-4 mt-8">
                <button
                  className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
                  onClick={() => {
                    addToCart({
                      id: productoId,
                      nombre: productoMapeado.nombre,
                      precio: precioUnitario,
                      precioBase: PRECIO_BASE,
                      imageUrl: productoMapeado.imageUrl || '',
                      cantidad,
                      stock: (productoMapeado.stock as number ?? 0),
                    });
                    onClose();
                  }}
                >
                  Añadir al carrito
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-8">
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded font-semibold cursor-not-allowed opacity-80"
                  disabled
                >
                  Producto sin Stock
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}