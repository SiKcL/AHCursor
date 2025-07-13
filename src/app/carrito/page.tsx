import React from 'react';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';

export default function CarritoPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const total = cart.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Carrito de compras</h2>
        {cart.length === 0 ? (
          <div className="text-center text-gray-500">Tu carrito está vacío.</div>
        ) : (
          <>
            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-center">Cantidad</th>
                  <th className="p-2 text-right">Precio</th>
                  <th className="p-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2">{item.nombre}</td>
                    <td className="p-2 text-center">{item.cantidad}</td>
                    <td className="p-2 text-right">${item.precio.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <button className="text-red-600 hover:underline text-xs" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold text-lg">Total:</div>
              <div className="font-bold text-lg">${total.toLocaleString()}</div>
            </div>
            <div className="flex gap-4">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300 transition" onClick={clearCart}>Vaciar carrito</button>
              <button className="bg-purple-700 text-white px-6 py-2 rounded font-bold hover:bg-purple-800 transition" onClick={() => router.push('/checkout')}>Finalizar compra</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 