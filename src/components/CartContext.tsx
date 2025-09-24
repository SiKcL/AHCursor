"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number; // precio unitario actual (con descuento)
  precioBase: number; // precio original del producto
  imageUrl: string | null;
  cantidad: number;
  stock: number;
  descuentos?: { tipo: 'general' | 'por_cantidad', items: { min: number, precio?: number; porcentaje?: number }[] } | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cantidad'> & { cantidad?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, cantidad: number, precio?: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(item: Omit<CartItem, 'cantidad'> & { cantidad?: number }) {
    setCart(prev => {
      const found = prev.find(p => p.id === item.id);
      if (found) {
        const nuevaCantidad = item.cantidad ? item.cantidad : found.cantidad + 1;
        let nuevoPrecio = item.precio;
        
        // Recalcular precio con descuentos si es necesario
        if (item.descuentos && nuevaCantidad !== found.cantidad) {
          if (item.descuentos.tipo === 'general' && item.descuentos.items.length > 0) {
            const porcentaje = item.descuentos.items[0]?.porcentaje;
            if (typeof porcentaje === 'number' && !isNaN(porcentaje)) {
              nuevoPrecio = Math.round(item.precioBase * (1 - porcentaje / 100));
            }
          } else if (item.descuentos.tipo === 'por_cantidad') {
            const items = [...item.descuentos.items].sort((a, b) => b.min - a.min);
            let descuentoAplicado = false;
            for (const d of items) {
              if (nuevaCantidad >= d.min && typeof d.precio === 'number' && !isNaN(d.precio)) {
                nuevoPrecio = d.precio;
                descuentoAplicado = true;
                break;
              }
            }
            // Si no se aplicó ningún descuento, usar precio base
            if (!descuentoAplicado) {
              nuevoPrecio = item.precioBase;
            }
          }
        }
        
        return prev.map(p =>
          p.id === item.id
            ? { ...p, cantidad: nuevaCantidad, precio: nuevoPrecio, precioBase: item.precioBase, stock: item.stock, descuentos: item.descuentos }
            : p
        );
      }
      return [...prev, { ...item, cantidad: item.cantidad || 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function updateQuantity(id: number, cantidad: number, precio?: number) {
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        let nuevoPrecio = p.precio;
        
        // Si no se proporciona precio explícito, recalcular basado en descuentos
        if (precio === undefined && p.descuentos) {
          if (p.descuentos.tipo === 'general' && p.descuentos.items.length > 0) {
            const porcentaje = p.descuentos.items[0]?.porcentaje;
            if (typeof porcentaje === 'number' && !isNaN(porcentaje)) {
              nuevoPrecio = Math.round(p.precioBase * (1 - porcentaje / 100));
            }
          } else if (p.descuentos.tipo === 'por_cantidad') {
            const items = [...p.descuentos.items].sort((a, b) => b.min - a.min);
            let descuentoAplicado = false;
            for (const d of items) {
              if (cantidad >= d.min && typeof d.precio === 'number' && !isNaN(d.precio)) {
                nuevoPrecio = d.precio;
                descuentoAplicado = true;
                break;
              }
            }
            // Si no se aplicó ningún descuento, usar precio base
            if (!descuentoAplicado) {
              nuevoPrecio = p.precioBase;
            }
          }
        } else if (precio !== undefined) {
          nuevoPrecio = precio;
        }
        
        return { ...p, cantidad, precio: nuevoPrecio };
      }
      return p;
    }));
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}; 