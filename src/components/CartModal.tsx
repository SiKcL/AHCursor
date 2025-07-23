import React from 'react';
import { useCart } from './CartContext';
import { FaTimes, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function CartModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  // Lógica de descuentos por volumen y porcentajes (igual que en ProductoModal)
  function getDescuentoPorcentajePersonalizado(item: unknown, cantidad: number) {
    if (!item || typeof item !== 'object' || !('descuentos' in item)) return 0;
    const itemData = item as { descuentos: { tipo: string; items: { min: number; porcentaje: number }[] } };

    if (itemData.descuentos.tipo === 'general' && itemData.descuentos.items.length > 0) {
      return itemData.descuentos.items[0].porcentaje;
    }
    if (itemData.descuentos.tipo === 'por_cantidad') {
      const items = [...itemData.descuentos.items].sort((a, b) => b.min - a.min);
      for (const d of items) {
        if (cantidad >= d.min) return d.porcentaje;
      }
    }
    return 0;
  }
  function getPrecioUnitario(precioBase: number, cantidad: number, item: unknown) {
    const descuento = getDescuentoPorcentajePersonalizado(item, cantidad);
    return Math.round(precioBase * (1 - descuento / 100));
  }
  const total = cart.reduce((sum, item) => {
    const precioUnitario = getPrecioUnitario(item.precioBase, item.cantidad, item);
    return sum + precioUnitario * item.cantidad;
  }, 0);
  const router = useRouter();
  const { isAuth } = useAuth();

  // Función para formatear precios en CLP
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

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
              {cart.map(item => {
                const precioUnitario = getPrecioUnitario(item.precioBase, item.cantidad, item);
                const totalItem = precioUnitario * item.cantidad;
                const stock = typeof item.stock === 'number' ? item.stock : 99;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-2">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.nombre} width={48} height={48} className="w-12 h-12 object-cover rounded" />}
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900">{item.nombre}</div>
                      <div className="text-sm text-gray-500">{formatPrice(precioUnitario)} <span className="text-xs">IVA incl.</span></div>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          className="px-2 py-1 bg-blue-200 rounded text-blue-800 font-bold"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1), getPrecioUnitario(item.precioBase, Math.max(1, item.cantidad - 1), item))}
                          disabled={item.cantidad <= 1}
                        >-</button>
                        <input
                          type="number"
                          min={1}
                          max={stock}
                          value={item.cantidad}
                          onChange={e => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) val = 1;
                            if (val > stock) val = stock;
                            updateQuantity(item.id, val, getPrecioUnitario(item.precioBase, val, item));
                          }}
                          onBlur={e => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) val = 1;
                            if (val > stock) val = stock;
                            if (val !== item.cantidad) {
                              updateQuantity(item.id, val, getPrecioUnitario(item.precioBase, val, item));
                            }
                          }}
                          onFocus={e => e.target.select()}
                          className="w-12 h-8 text-center border rounded px-1 py-0 text-lg font-bold mx-1"
                          style={{ appearance: 'textfield' }}
                        />
                        <button
                          className="px-2 py-1 bg-blue-200 rounded text-blue-800 font-bold"
                          onClick={() => updateQuantity(item.id, Math.min(stock, item.cantidad + 1), getPrecioUnitario(item.precioBase, Math.min(stock, item.cantidad + 1), item))}
                          disabled={item.cantidad >= stock}
                        >+</button>
                        <span className="ml-2 text-xs text-gray-400">Stock: {stock}</span>
                      </div>
                    </div>
                    <div className="text-right min-w-[70px] font-bold text-blue-900">{formatPrice(totalItem)}</div>
                    <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-blue-900">Total:</span>
              <span className="font-bold text-lg text-blue-800">${total}</span>
            </div>
            {isAuth ? (
              <button className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition mb-2"
                onClick={() => { onClose(); router.push('/checkout'); }}>
                Proceder a la compra
              </button>
            ) : (
              <div className="flex flex-col gap-2 mb-2">
                <div className="text-center text-red-600 font-semibold mb-2">Debes registrarte o iniciar sesión para proceder con la compra.</div>
                <button className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition"
                  onClick={() => { onClose(); router.push('/login?redirect=/checkout'); }}>
                  Iniciar Sesión
                </button>
                <button className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition"
                  onClick={() => { onClose(); router.push('/registro?redirect=/checkout'); }}>
                  Registrarse
                </button>
              </div>
            )}
            <button className="w-full bg-gray-200 text-blue-700 py-2 rounded font-semibold hover:bg-gray-300 transition" onClick={clearCart}>Vaciar carrito</button>
          </>
        )}
      </div>
    </div>
  );
} 