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
        return prev.map(p =>
          p.id === item.id
            ? { ...p, cantidad: item.cantidad ? item.cantidad : p.cantidad + 1, precio: item.precio, precioBase: item.precioBase, stock: item.stock }
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
    setCart(prev => prev.map(p => p.id === id ? { ...p, cantidad, ...(precio !== undefined ? { precio } : {}) } : p));
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