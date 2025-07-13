"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';

interface Direccion {
  region: string;
  comuna: string;
  calle: string;
  numero: string;
  depto_oficina?: string;
  nombre_recibe?: string;
  apellido_recibe?: string;
  telefono_recibe?: string;
}

export default function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [perfil, setPerfil] = useState<any>(null);
  const [form, setForm] = useState<any>({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    region: '',
    comuna: '',
    calle: '',
    numero: '',
    depto_oficina: '',
    nombre_recibe: '',
    apellido_recibe: '',
    telefono_recibe: ''
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar datos personales y dirección principal
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/user?section=profile', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => {
        setPerfil(data);
        setForm((f: any) => ({
          ...f,
          nombre: data?.nombre || '',
          apellido: data?.apellido || '',
          rut: data?.rut || '',
          email: data?.email || '',
          telefono: data?.telefono || ''
        }));
      });
    fetch('/api/user?section=direcciones', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then((dirs) => {
        if (Array.isArray(dirs) && dirs.length > 0) {
          const d = dirs[0];
          setForm((f: any) => ({
            ...f,
            region: d.region || '',
            comuna: d.comuna || '',
            calle: d.calle || '',
            numero: d.numero || '',
            depto_oficina: d.depto_oficina || '',
            nombre_recibe: d.nombre_recibe || '',
            apellido_recibe: d.apellido_recibe || '',
            telefono_recibe: d.telefono_recibe || ''
          }));
        }
      });
  }, []);

  // Manejo de formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };

  // Guardar dirección si no existe y avanzar a confirmación
  const handleContinuar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    // Validar campos básicos
    for (const key of ['nombre','apellido','rut','email','telefono','region','comuna','calle','numero','nombre_recibe','apellido_recibe','telefono_recibe']) {
      if (!form[key]) {
        setError('Por favor completa todos los campos obligatorios.');
        return;
      }
    }
    // Guardar dirección si no existe
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user?section=direcciones', { headers: { Authorization: 'Bearer ' + token } });
    const dirs = await res.json();
    if (!Array.isArray(dirs) || dirs.length === 0) {
      // Crear dirección
      const res2 = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          region: form.region,
          comuna: form.comuna,
          calle: form.calle,
          numero: form.numero,
          depto_oficina: form.depto_oficina,
          nombre_recibe: form.nombre_recibe,
          apellido_recibe: form.apellido_recibe,
          telefono_recibe: form.telefono_recibe
        })
      });
      if (!res2.ok) {
        setError('Error guardando dirección');
        return;
      }
    }
    setStep(2);
  };

  // Enviar pedido
  const handlePagar = async () => {
    setLoading(true);
    setError('');
    setMsg('');
    const token = localStorage.getItem('token');
    // Obtener dirección principal
    const resDir = await fetch('/api/user?section=direcciones', { headers: { Authorization: 'Bearer ' + token } });
    const dirs = await resDir.json();
    const direccionId = Array.isArray(dirs) && dirs.length > 0 ? dirs[0].id : null;
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        productos: cart,
        direccion_id: direccionId,
      })
    });
    if (res.ok) {
      setMsg('¡Pedido realizado con éxito!');
      clearCart();
      setTimeout(() => router.push('/perfil?pedido=ok'), 2000);
    } else {
      setError('Error al procesar el pedido');
    }
    setLoading(false);
  };

  const total = cart.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8 flex flex-col md:flex-row gap-8">
        {/* Formulario a la izquierda */}
        <div className="flex-1 min-w-0">
          {step === 1 && (
            <form onSubmit={handleContinuar}>
              <h3 className="text-2xl font-bold mb-4 text-[color:var(--primary)]">Datos de contacto y entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Apellido</label>
                  <input name="apellido" value={form.apellido} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">RUT</label>
                  <input name="rut" value={form.rut} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">E-mail</label>
                  <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
              </div>
              <h4 className="text-lg font-bold mb-2 mt-6 text-[color:var(--primary)]">Dirección de entrega</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Región</label>
                  <input name="region" value={form.region} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Comuna</label>
                  <input name="comuna" value={form.comuna} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Calle</label>
                  <input name="calle" value={form.calle} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Número</label>
                  <input name="numero" value={form.numero} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">N° depto / oficina / otro dato (si aplica)</label>
                  <input name="depto_oficina" value={form.depto_oficina} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre de quien recibe</label>
                  <input name="nombre_recibe" value={form.nombre_recibe} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Apellido de quien recibe</label>
                  <input name="apellido_recibe" value={form.apellido_recibe} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Teléfono de quien recibe</label>
                  <input name="telefono_recibe" value={form.telefono_recibe} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
                </div>
              </div>
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <div className="flex justify-between mt-8">
                <button className="text-[color:var(--primary)] hover:underline" type="button" onClick={() => router.back()}>&lt; Volver</button>
                <button className="bg-[color:var(--primary)] text-white px-8 py-2 rounded font-bold hover:bg-[color:var(--secondary)] transition" type="submit">Continuar</button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div>
              <h3 className="text-2xl font-bold mb-4 text-[color:var(--primary)]">Confirmación</h3>
              <div className="mb-4">Revisa tus datos y dirección antes de pagar.</div>
              <div className="mb-4">
                <strong>Productos:</strong>
                <ul className="divide-y divide-gray-200">
                  {cart.map(item => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      {item.imageUrl && <Image src={item.imageUrl} alt={item.nombre} width={56} height={56} className="w-14 h-14 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[color:var(--primary)] truncate">{item.nombre}</div>
                        <div className="text-sm text-gray-500">Cantidad: {item.cantidad}</div>
                        <div className="text-sm text-gray-500">Precio: ${item.precio.toLocaleString()}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <strong>Dirección:</strong> {form.region}, {form.comuna}, {form.calle} #{form.numero}{form.depto_oficina && `, ${form.depto_oficina}`}
              </div>
              <div className="mb-4 font-bold text-lg">Total: ${total.toLocaleString()}</div>
              {msg && <div className="text-green-600 text-sm mb-2">{msg}</div>}
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <div className="flex gap-4 mt-2">
                <button className="bg-[color:var(--primary)] text-white px-6 py-2 rounded font-bold hover:bg-[color:var(--secondary)] transition" onClick={handlePagar} disabled={loading || cart.length === 0}>Pagar</button>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300 transition" onClick={() => setStep(1)}>Volver</button>
              </div>
            </div>
          )}
        </div>
        {/* Carrito editable a la derecha */}
        <aside className="w-full md:w-96 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <h4 className="text-lg font-bold mb-4 text-[color:var(--primary)]">Carrito ({cart.length} producto{cart.length !== 1 ? 's' : ''})</h4>
            {cart.length === 0 ? (
              <div className="text-gray-500">No hay productos en tu carrito.</div>
            ) : (
              <ul className="divide-y divide-gray-200 mb-4">
                {cart.map(item => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.nombre} width={56} height={56} className="w-14 h-14 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[color:var(--primary)] truncate">{item.nombre}</div>
                      <div className="text-sm text-gray-500">${item.precio.toLocaleString()}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <button className="px-2 py-1 bg-gray-200 rounded text-[color:var(--primary)] font-bold" onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}>-</button>
                        <span className="px-2">{item.cantidad}</span>
                        <button className="px-2 py-1 bg-gray-200 rounded text-[color:var(--primary)] font-bold" onClick={() => updateQuantity(item.id, item.cantidad + 1)}>+</button>
                        <button className="ml-2 text-red-500 hover:text-red-700" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-lg text-[color:var(--primary)]">${total.toLocaleString()}</span>
            </div>
            <button className="w-full bg-gray-200 text-[color:var(--primary)] py-2 rounded font-semibold hover:bg-gray-300 transition mt-2" onClick={clearCart}>Vaciar carrito</button>
          </div>
        </aside>
      </div>
    </div>
  );
} 