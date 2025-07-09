"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imageUrl: string | null;
  cantidad: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cantidad'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => void;
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

  function addToCart(item: Omit<CartItem, 'cantidad'>) {
    setCart(prev => {
      const found = prev.find(p => p.id === item.id);
      if (found) {
        return prev.map(p => p.id === item.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function updateQuantity(id: number, cantidad: number) {
    setCart(prev => prev.map(p => p.id === id ? { ...p, cantidad } : p));
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