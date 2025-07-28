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
  descuentos?: { tipo: 'general' | 'por_cantidad', items: { min: number, precio?: number; porcentaje?: number }[] } | null;
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
  // Eliminar la constante DESCUENTOS (definida pero no usada)
  const PRECIO_BASE = productoMapeado.precio;

  // Lógica de descuentos personalizados
  const descuentos = productoMapeado.descuentos;
  function getPrecioUnitarioPersonalizado(cantidad: number) {
    if (!descuentos) return PRECIO_BASE;
    if (descuentos.tipo === 'general' && descuentos.items.length > 0) {
      const porcentaje = descuentos.items[0].porcentaje;
      return Math.round(PRECIO_BASE * (1 - (porcentaje ?? 0) / 100));
    }
    if (descuentos.tipo === 'por_cantidad') {
      const items = [...descuentos.items].sort((a, b) => b.min - a.min);
      for (const item of items) {
        if (cantidad >= item.min) return item.precio ?? PRECIO_BASE;
      }
      return PRECIO_BASE;
    }
    return PRECIO_BASE;
  }
  const precioUnitario = getPrecioUnitarioPersonalizado(cantidad);
  const totalPagar = precioUnitario * cantidad;
  // Tabla de descuentos personalizada
  let tablaDescuentos = null;
  if (descuentos) {
    if (descuentos.tipo === 'general' && descuentos.items.length > 0) {
      tablaDescuentos = (
        <li>
          Cualquier cantidad – <span className="font-bold">{descuentos.items[0].porcentaje}% de descuento</span>
        </li>
      );
    } else if (descuentos.tipo === 'por_cantidad') {
      tablaDescuentos = descuentos.items
        .sort((a, b) => a.min - b.min)
        .map((item, idx) => (
          <li key={idx}>
            Sobre {item.min} uni. – <span className="font-bold">{formatPrice(item.precio ?? 0)}</span>
          </li>
        ));
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-2 md:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md md:max-w-4xl relative flex flex-col md:flex-row overflow-y-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()} 
        style={{ minHeight: 'auto' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 bg-white/50 rounded-full p-1 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Sección de la Imagen */}
        <div className="w-full md:w-1/2 p-2 md:p-4 flex items-center justify-center bg-gray-100">
          <div className="relative w-full h-48 md:h-[400px]">
                <Image
                    src={productoMapeado.imageUrl || '/placeholder.png'}
                    alt={`Imagen de ${productoMapeado.nombre}`}
                    fill
              className="object-contain"
                />
            </div>
        </div>
        {/* Sección de la Descripción */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">{productoMapeado.nombre}</h2>
            </div>
          <p className="text-gray-700 mt-2 md:mt-4 text-base leading-relaxed">
                {productoMapeado.descripcion || 'Este producto no tiene una descripción detallada.'}
            </p>
          <div className="text-2xl md:text-4xl font-bold text-green-600 mt-4 md:mt-8">
            {formatPrice(precioUnitario)} <span className="text-base font-normal text-gray-600">IVA incl.</span>
          </div>
            {typeof productoMapeado.stock === 'number' && (
              <div className="text-sm text-gray-500 mt-1">Stock: {productoMapeado.stock}</div>
            )}
            {/* Tabla de descuentos por volumen */}
          {descuentos && (
            <div className="mt-3 mb-2">
              <div className="bg-blue-50 border border-blue-200 rounded p-2 md:p-3 text-blue-800 text-xs md:text-sm font-semibold mb-2">
                Este producto cuenta con descuento por volumen
              </div>
              <ul className="text-xs md:text-sm text-gray-700 space-y-1">
                {tablaDescuentos}
              </ul>
            </div>
          )}
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
              className="w-14 md:w-16 text-center border rounded px-2 py-1 text-lg font-bold"
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
                className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition w-full"
                  onClick={() => {
                    addToCart({
                      id: productoId,
                      nombre: productoMapeado.nombre,
                      precio: precioUnitario,
                      precioBase: PRECIO_BASE,
                      imageUrl: productoMapeado.imageUrl || '',
                      cantidad,
                      stock: (productoMapeado.stock as number ?? 0),
                      descuentos: productoMapeado.descuentos || null,
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
                className="bg-red-600 text-white px-6 py-2 rounded font-semibold cursor-not-allowed opacity-80 w-full"
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