"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';
import Modal from 'react-modal';

interface FormularioCheckout {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  calle: string;
  numero: string;
  depto_oficina: string;
  nombre_recibe: string;
  apellido_recibe: string;
  telefono_recibe: string;
  direccion_id?: number;
}

interface Direccion {
  id: number;
  region: string;
  comuna: string;
  calle: string;
  numero: string;
  depto_oficina?: string;
  nombre_recibe?: string;
  apellido_recibe?: string;
  telefono_recibe?: string;
}

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imageUrl?: string | null;
  precioBase: number; // Added precioBase to the interface
  stock: number; // Added stock to the interface
}

// Lógica de descuentos por volumen y porcentajes (igual que en ProductoModal y CartModal)
function getDescuentoPorcentajePersonalizado(item: unknown, cantidad: number) {
  if (!item || typeof item !== 'object' || !('descuentos' in item)) return 0;
  const descuentos = (item as { descuentos?: { tipo: string; items: { min: number; porcentaje: number }[] } }).descuentos;
  if (!descuentos) return 0;
  if (descuentos.tipo === 'general' && descuentos.items && descuentos.items.length > 0) {
    return descuentos.items[0].porcentaje;
  }
  if (descuentos.tipo === 'por_cantidad') {
    const items = [...(descuentos.items || [])].sort((a, b) => b.min - a.min);
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

export default function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormularioCheckout>({
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
  // Agregar estados para guardar el resumen del pedido
  const [pedidoResumen, setPedidoResumen] = useState<{productos: CartItem[], total: number} | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<number | null>(null);
  const [modalDireccion, setModalDireccion] = useState(false);
  const [nuevaDireccion, setNuevaDireccion] = useState({
    region: '', comuna: '', calle: '', numero: '', depto_oficina: '', nombre_recibe: '', apellido_recibe: '', telefono_recibe: ''
  });

  // Cargar datos personales y dirección principal
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/user?section=profile', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => {
        setForm((f: FormularioCheckout) => ({
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
      .then((dirs: Direccion[]) => {
        setDirecciones(Array.isArray(dirs) ? dirs : []);
        if (Array.isArray(dirs) && dirs.length > 0) {
          setDireccionSeleccionada(dirs[0].id);
          setForm(f => ({ ...f, direccion_id: dirs[0].id }));
        }
      });
  }, []);

  // Manejo de formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f: FormularioCheckout) => ({ ...f, [name]: value }));
  };

  // Guardar dirección y avanzar a confirmación
  const handleContinuar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    // Validar solo datos personales y dirección seleccionada
    for (const key of ['nombre','apellido','rut','email','telefono']) {
      if (!form[key as keyof FormularioCheckout]) {
        setError('Por favor completa todos los campos obligatorios.');
        return;
      }
    }
    if (!direccionSeleccionada) {
      setError('Por favor selecciona una dirección de entrega.');
      return;
    }
    setForm(f => ({ ...f, direccion_id: direccionSeleccionada }));
    setStep(2);
  };

  // Enviar pedido
  const handlePagar = async () => {
    setError('');
    setMsg('');
    const token = localStorage.getItem('token');
    // Usar el id de la dirección recién guardada
    const direccionId = form.direccion_id;
    if (!direccionId) {
      setError('No se pudo obtener la dirección.');
      return;
    }
    // Guardar resumen antes de limpiar el carrito
    setPedidoResumen({ productos: [...cart], total: cart.reduce((sum, p) => sum + p.precio * p.cantidad, 0) });
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        productos: cart,
        direccion_id: direccionId,
      })
    });
    if (res.ok) {
      setMsg('¡Pedido realizado con éxito! Nos comunicaremos contigo para la gestión');
      clearCart();
      setTimeout(() => router.push('/perfil?pedido=ok'), 2000);
    } else {
      setError('Error al procesar el pedido');
    }
  };

  // Usar el precio unitario con descuento para el total
  const total = cart.reduce((sum, item) => {
    const precioUnitario = getPrecioUnitario(item.precioBase, item.cantidad, item);
    return sum + precioUnitario * item.cantidad;
  }, 0);

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
              {/* Dirección de entrega */}
              <h4 className="text-lg font-bold mb-2 mt-6 text-[color:var(--primary)]">Dirección de entrega</h4>
              {direcciones.length === 0 ? (
                <div className="border-2 border-black p-4 mb-4 flex flex-col items-center">
                  <span>No hay ninguna direccion registrada</span>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-100 border border-blue-400 rounded text-blue-800 font-semibold hover:bg-blue-200"
                    type="button"
                    onClick={() => setModalDireccion(true)}
                  >
                    Añadir una nueva dirección de entrega
                  </button>
                </div>
              ) : (
                <div className="border-2 border-blue-400 p-4 mb-4">
                  <div className="mb-2 font-semibold">Selecciona una dirección:</div>
                  <ul>
                    {direcciones.map(dir => (
                      <li key={dir.id} className="mb-2 flex items-center gap-2">
                        <input
                          type="radio"
                          name="direccion"
                          checked={direccionSeleccionada === dir.id}
                          onChange={() => {
                            setDireccionSeleccionada(dir.id);
                            setForm(f => ({ ...f, direccion_id: dir.id }));
                          }}
                        />
                        <span>{dir.region}, {dir.comuna}, {dir.calle} #{dir.numero}{dir.depto_oficina ? ', ' + dir.depto_oficina : ''} - {dir.nombre_recibe} {dir.apellido_recibe} ({dir.telefono_recibe})</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-100 border border-blue-400 rounded text-blue-800 font-semibold hover:bg-blue-200"
                    type="button"
                    onClick={() => setModalDireccion(true)}
                  >
                    Añadir una nueva dirección de entrega
                  </button>
                </div>
              )}
              <Modal
                isOpen={modalDireccion}
                onRequestClose={() => setModalDireccion(false)}
                className="bg-white p-8 rounded shadow-md w-full max-w-lg mx-auto mt-32 outline-none"
                overlayClassName="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30"
                ariaHideApp={false}
              >
                <h3 className="text-xl font-bold mb-4">Nueva dirección de entrega</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/user', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                      body: JSON.stringify(nuevaDireccion)
                    });
                    if (res.ok) {
                      const data = await res.json();
                      // Recargar direcciones y seleccionar la nueva
                      const resDirs = await fetch('/api/user?section=direcciones', { headers: { Authorization: 'Bearer ' + token } });
                      const dirs: Direccion[] = await resDirs.json();
                      setDirecciones(dirs);
                      setDireccionSeleccionada(data.id);
                      setForm(f => ({ ...f, direccion_id: data.id }));
                      setModalDireccion(false);
                      setNuevaDireccion({ region: '', comuna: '', calle: '', numero: '', depto_oficina: '', nombre_recibe: '', apellido_recibe: '', telefono_recibe: '' });
                    }
                  }}
                  className="flex flex-col gap-3"
                >
                  <input type="text" placeholder="Región" className="border px-3 py-2 rounded" value={nuevaDireccion.region} onChange={e => setNuevaDireccion(a => ({ ...a, region: e.target.value }))} required />
                  <input type="text" placeholder="Comuna" className="border px-3 py-2 rounded" value={nuevaDireccion.comuna} onChange={e => setNuevaDireccion(a => ({ ...a, comuna: e.target.value }))} required />
                  <input type="text" placeholder="Calle" className="border px-3 py-2 rounded" value={nuevaDireccion.calle} onChange={e => setNuevaDireccion(a => ({ ...a, calle: e.target.value }))} required />
                  <input type="text" placeholder="Número" className="border px-3 py-2 rounded" value={nuevaDireccion.numero} onChange={e => setNuevaDireccion(a => ({ ...a, numero: e.target.value }))} required />
                  <input type="text" placeholder="N° depto / oficina / otro dato (si aplica)" className="border px-3 py-2 rounded" value={nuevaDireccion.depto_oficina} onChange={e => setNuevaDireccion(a => ({ ...a, depto_oficina: e.target.value }))} />
                  <input type="text" placeholder="Nombre de quien recibe" className="border px-3 py-2 rounded" value={nuevaDireccion.nombre_recibe} onChange={e => setNuevaDireccion(a => ({ ...a, nombre_recibe: e.target.value }))} required />
                  <input type="text" placeholder="Apellido de quien recibe" className="border px-3 py-2 rounded" value={nuevaDireccion.apellido_recibe} onChange={e => setNuevaDireccion(a => ({ ...a, apellido_recibe: e.target.value }))} required />
                  <input type="text" placeholder="Teléfono de quien recibe" className="border px-3 py-2 rounded" value={nuevaDireccion.telefono_recibe} onChange={e => setNuevaDireccion(a => ({ ...a, telefono_recibe: e.target.value }))} required />
                  <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 transition">Guardar dirección</button>
                  <button type="button" className="mt-2 text-blue-700 underline" onClick={() => setModalDireccion(false)}>Cancelar</button>
                </form>
              </Modal>
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
                  {(pedidoResumen ? pedidoResumen.productos : cart).map(item => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      {item.imageUrl && <Image src={item.imageUrl} alt={item.nombre} width={56} height={56} className="w-14 h-14 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[color:var(--primary)] truncate">{item.nombre}</div>
                        <div className="text-sm text-gray-500">Cantidad: {item.cantidad}</div>
                        <div className="text-sm text-gray-500">Precio: ${getPrecioUnitario(item.precioBase, item.cantidad, item).toLocaleString()}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <strong>Dirección:</strong> {direcciones.find(d => d.id === direccionSeleccionada) ? (
                  <span>{direcciones.find(d => d.id === direccionSeleccionada)?.region}, {direcciones.find(d => d.id === direccionSeleccionada)?.comuna}, {direcciones.find(d => d.id === direccionSeleccionada)?.calle} #{direcciones.find(d => d.id === direccionSeleccionada)?.numero}{direcciones.find(d => d.id === direccionSeleccionada)?.depto_oficina && `, ${direcciones.find(d => d.id === direccionSeleccionada)?.depto_oficina}`} - {direcciones.find(d => d.id === direccionSeleccionada)?.nombre_recibe} {direcciones.find(d => d.id === direccionSeleccionada)?.apellido_recibe} ({direcciones.find(d => d.id === direccionSeleccionada)?.telefono_recibe})</span>
                ) : <span>No seleccionada</span>}
              </div>
              <div className="mb-4 font-bold text-lg">Total: ${pedidoResumen ? pedidoResumen.total.toLocaleString() : total.toLocaleString()}</div>
              {msg && (
                <div className="text-green-700 text-xl font-bold mb-4">
                  ¡Pedido realizado con éxito!<br />Nos comunicaremos contigo para la gestión
                </div>
              )}
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <div className="flex gap-4 mt-2">
                <button type="button" onClick={handlePagar} className="bg-blue-900 text-white px-6 py-2 rounded font-bold hover:bg-blue-800 mr-2">Realizar Pedido</button>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300 transition" onClick={() => setStep(1)}>Volver</button>
              </div>
            </div>
          )}
        </div>
        {/* Carrito editable a la derecha */}
        {step === 1 && (
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
                        <div className="text-sm text-gray-500">${getPrecioUnitario(item.precioBase, item.cantidad, item).toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <button className="px-2 py-1 bg-gray-200 rounded text-[color:var(--primary)] font-bold" onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}>-</button>
                          <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.cantidad}
                            onChange={e => {
                              let val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) val = 1;
                              if (val > item.stock) val = item.stock;
                              updateQuantity(item.id, val);
                            }}
                            onBlur={e => {
                              let val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) val = 1;
                              if (val > item.stock) val = item.stock;
                              if (val !== item.cantidad) {
                                updateQuantity(item.id, val);
                              }
                            }}
                            onFocus={e => e.target.select()}
                            className="w-20 h-10 text-center border rounded px-2 py-0 text-lg font-bold mx-2"
                            style={{ appearance: 'textfield' }}
                          />
                          <button
                            className="px-2 py-1 bg-gray-200 rounded text-[color:var(--primary)] font-bold"
                            onClick={() => updateQuantity(item.id, Math.min(item.stock, item.cantidad + 1))}
                            disabled={item.cantidad >= item.stock}
                          >+</button>
                          <button className="ml-2 text-red-500 hover:text-red-700" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                          <span className="ml-3 text-xs text-gray-500">Stock: {item.stock}</span>
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
        )}
      </div>
    </div>
  );
} 