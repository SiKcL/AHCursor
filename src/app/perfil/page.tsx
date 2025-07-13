"use client";
import { useState, useEffect } from 'react';

const SECCIONES = [
  { key: 'compras', label: 'Compras' },
  { key: 'favoritos', label: 'Productos favoritos' },
  { key: 'datos', label: 'Datos personales' },
  { key: 'direcciones', label: 'Direcciones' },
  { key: 'facturacion', label: 'Datos de facturación' },
  { key: 'contrasena', label: 'Contraseña' },
];

export default function PerfilPage() {
  const [seccion, setSeccion] = useState('compras');
  // Datos personales
  const [perfil, setPerfil] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>({});
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Cargar datos personales al entrar a la sección
  useEffect(() => {
    if (seccion === 'datos') {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch('/api/user?section=profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setPerfil(data);
          setForm(data);
        });
    }
  }, [seccion]);

  const handleEdit = () => {
    setEditando(true);
    setMsg('');
    setError('');
  };
  const handleCancel = () => {
    setEditando(false);
    setForm(perfil);
    setMsg('');
    setError('');
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };
  const handleSave = async (e: any) => {
    e.preventDefault();
    setMsg('');
    setError('');
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nombre: form.nombre,
        apellido: form.apellido,
        rut: form.rut,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
        factura: form.factura
      })
    });
    if (res.ok) {
      setMsg('Datos actualizados correctamente.');
      setEditando(false);
      setPerfil({ ...perfil, ...form });
    } else {
      const data = await res.json();
      setError(data.error || 'Error actualizando datos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8 flex flex-col md:flex-row gap-8">
        {/* Menú lateral */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4 text-[color:var(--primary)]">Mi cuenta</h2>
          <nav className="flex flex-col gap-2">
            {SECCIONES.map(sec => (
              <button
                key={sec.key}
                className={`text-left px-4 py-3 rounded font-semibold transition-all ${seccion === sec.key ? 'bg-purple-700 text-white shadow' : 'bg-white text-gray-800 hover:bg-purple-100'}`}
                onClick={() => setSeccion(sec.key)}
              >
                {sec.label}
              </button>
            ))}
          </nav>
        </aside>
        {/* Contenido dinámico */}
        <section className="flex-1 min-w-0">
          {seccion === 'compras' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Compras</h3>
              <p>Aquí aparecerán tus compras realizadas.</p>
            </div>
          )}
          {seccion === 'favoritos' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Productos favoritos</h3>
              <p>No hay productos favoritos, agrega algunos a tu lista de favoritos.</p>
            </div>
          )}
          {seccion === 'datos' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Datos personales</h3>
              {!perfil ? (
                <p>Cargando datos...</p>
              ) : editando ? (
                <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold">Nombre</label>
                    <input name="nombre" value={form.nombre || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Apellido</label>
                    <input name="apellido" value={form.apellido || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">RUT</label>
                    <input name="rut" value={form.rut || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Fecha de nacimiento</label>
                    <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento ? form.fecha_nacimiento.substring(0,10) : ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Teléfono</label>
                    <input name="telefono" value={form.telefono || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <input type="checkbox" name="factura" checked={!!form.factura} onChange={e => setForm((f: any) => ({ ...f, factura: e.target.checked }))} />
                    <span className="text-sm">Necesito comprar con factura</span>
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {msg && <div className="text-green-600 text-sm">{msg}</div>}
                  <div className="flex gap-4 mt-2">
                    <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800 transition">Guardar</button>
                    <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300 transition" onClick={handleCancel}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 max-w-lg">
                  <div className="mb-2"><span className="font-bold">Nombre:</span> {perfil.nombre} {perfil.apellido}</div>
                  <div className="mb-2"><span className="font-bold">RUT:</span> {perfil.rut}</div>
                  <div className="mb-2"><span className="font-bold">Fecha de nacimiento:</span> {perfil.fecha_nacimiento ? perfil.fecha_nacimiento.substring(0,10) : '-'}</div>
                  <div className="mb-2"><span className="font-bold">Email:</span> {perfil.email}</div>
                  <div className="mb-2"><span className="font-bold">Teléfono:</span> {perfil.telefono}</div>
                  <div className="mb-2"><span className="font-bold">Factura:</span> {perfil.factura ? 'Sí' : 'No'}</div>
                  {msg && <div className="text-green-600 text-sm">{msg}</div>}
                  <button className="mt-4 text-blue-700 hover:underline text-sm" onClick={handleEdit}>Modificar &gt;</button>
                </div>
              )}
            </div>
          )}
          {seccion === 'direcciones' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Direcciones</h3>
              <p>No hay direcciones registradas.</p>
            </div>
          )}
          {seccion === 'facturacion' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Datos de facturación</h3>
              <p>No tienes datos de facturación guardados.</p>
            </div>
          )}
          {seccion === 'contrasena' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Contraseña</h3>
              <p>Aquí podrás cambiar tu contraseña.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 