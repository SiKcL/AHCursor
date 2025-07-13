import React from 'react';
import { useCart } from './CartContext';
import { FaTimes, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const total = cart.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-2 right-2 text-blue-700 hover:text-blue-900" onClick={onClose}>
          <FaTimes size={22} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-800">Carrito de compras</h2>
        {cart.length === 0 ? (
          <p className="text-gray-600">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 mb-4 max-h-60 overflow-y-auto">
              {cart.map(item => (
                <li key={item.id} className="flex items-center gap-3 py-2">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.nombre} width={48} height={48} className="w-12 h-12 object-cover rounded" />}
                  <div className="flex-1">
                    <div className="font-semibold text-blue-900">{item.nombre}</div>
                    <div className="text-sm text-gray-500">${item.precio}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button className="px-2 py-1 bg-blue-200 rounded text-blue-800 font-bold" onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}>-</button>
                      <span className="px-2">{item.cantidad}</span>
                      <button className="px-2 py-1 bg-blue-200 rounded text-blue-800 font-bold" onClick={() => updateQuantity(item.id, item.cantidad + 1)}>+</button>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-blue-900">Total:</span>
              <span className="font-bold text-lg text-blue-800">${total}</span>
            </div>
            <button className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition mb-2"
              onClick={() => { onClose(); router.push('/checkout'); }}>
              Proceder a la compra
            </button>
            <button className="w-full bg-gray-200 text-blue-700 py-2 rounded font-semibold hover:bg-gray-300 transition" onClick={clearCart}>Vaciar carrito</button>
          </>
        )}
      </div>
    </div>
  );
} 