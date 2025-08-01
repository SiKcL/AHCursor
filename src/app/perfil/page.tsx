"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

const SECCIONES = [
  { key: 'compras', label: 'Compras' },
  { key: 'datos', label: 'Datos personales' },
  { key: 'direcciones', label: 'Direcciones' },
  { key: 'facturacion', label: 'Datos de facturación' },
  { key: 'contrasena', label: 'Contraseña' },
] as const;

type SeccionKey = typeof SECCIONES[number]['key'];

const REGIONES = [
  'Metropolitana',
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Libertador General Bernardo O\'Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén del General Carlos Ibáñez del Campo',
  'Magallanes y la Antártica Chilena',
];

// Definir interfaces para los tipos de datos
interface Perfil {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rut?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  factura?: boolean;
}

interface Facturacion {
  razon_social: string;
  rut: string;
  giro: string;
  telefono: string;
  region: string;
  comuna: string;
  calle: string;
  numero: string;
  depto_oficina?: string;
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

interface FormData {
  nombre: string;
  apellido: string;
  rut: string;
  fecha_nacimiento: string;
  telefono: string;
  factura: boolean;
}

// Definir tipo para pedido
interface Pedido {
  id: number;
  created_at: string;
  total: number;
  productos: { nombre: string; cantidad: number; precio: number }[];
  estado: string; // 'proceso', 'despachado', 'completado'
  region?: string;
  comuna?: string;
  calle?: string;
  numero?: string;
  depto_oficina?: string;
  nombre_recibe?: string;
  apellido_recibe?: string;
  telefono_recibe?: string;
}

// Función para formatear RUT chileno
function formatearRut(rut: string): string {
  if (!rut) return '';
  rut = rut.replace(/[^0-9kK]/g, '');
  if (rut.length < 2) return rut;
  const cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);
  dv = dv.toUpperCase();
  let cuerpoFormateado = '';
  let i = 0;
  for (let j = cuerpo.length - 1; j >= 0; j--) {
    cuerpoFormateado = cuerpo[j] + cuerpoFormateado;
    i++;
    if (i % 3 === 0 && j !== 0) cuerpoFormateado = '.' + cuerpoFormateado;
  }
  return `${cuerpoFormateado}-${dv}`;
}

export default function PerfilPage() {
  const [seccion, setSeccion] = useState<SeccionKey>('compras');
  // Datos personales
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<FormData>({
    nombre: '',
    apellido: '',
    rut: '',
    fecha_nacimiento: '',
    telefono: '',
    factura: false
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Estado para facturación
  const [facturacion, setFacturacion] = useState<Facturacion | null>(null);
  const [editandoFact, setEditandoFact] = useState(false);
  const [factForm, setFactForm] = useState<Facturacion>({ 
    razon_social: '', 
    rut: '', 
    giro: '', 
    telefono: '', 
    region: '', 
    comuna: '', 
    calle: '', 
    numero: '', 
    depto_oficina: '' 
  });
  const [msgFact, setMsgFact] = useState('');
  const [errorFact, setErrorFact] = useState('');

  // Estado para direcciones
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargandoDir, setCargandoDir] = useState(false);
  const [editandoDir, setEditandoDir] = useState<Direccion | null>(null); // null = no editando, objeto = editando
  const [formDir, setFormDir] = useState<Omit<Direccion, 'id'>>({ 
    region: '', 
    comuna: '', 
    calle: '', 
    numero: '', 
    depto_oficina: '', 
    nombre_recibe: '', 
    apellido_recibe: '', 
    telefono_recibe: '' 
  });
  const [msgDir, setMsgDir] = useState('');
  const [errorDir, setErrorDir] = useState('');
  const [agregandoNuevaDir, setAgregandoNuevaDir] = useState(false);

  // Estado para compras
  const [compras, setCompras] = useState<Pedido[]>([]);
  const [cargandoCompras, setCargandoCompras] = useState(false);

  // Cargar datos personales al entrar a la sección
  useEffect(() => {
    if (seccion === 'datos') {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch('/api/user?section=profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((data: Perfil) => {
          setPerfil(data);
          setForm({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            rut: data.rut || '',
            fecha_nacimiento: data.fecha_nacimiento || '',
            telefono: data.telefono || '',
            factura: data.factura || false
          });
        });
    }
  }, [seccion]);

  // Cargar datos de facturación al entrar a la sección
  useEffect(() => {
    if (seccion === 'facturacion' || seccion === 'datos') {
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch('/api/user?section=facturacion', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((data: Facturacion | null) => {
          setFacturacion(data);
          setFactForm(data || { 
            razon_social: '', 
            rut: '', 
            giro: '', 
            telefono: '', 
            region: '', 
            comuna: '', 
            calle: '', 
            numero: '', 
            depto_oficina: '' 
          });
        });
    }
  }, [seccion]);

  // Cargar direcciones al entrar a la sección
  useEffect(() => {
    if (seccion === 'direcciones') {
      cargarDirecciones();
    }
  }, [seccion]);

  // Cargar compras al entrar a la sección
  useEffect(() => {
    if (seccion === 'compras') {
      setCargandoCompras(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch('/api/pedidos', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then((data) => {
          setCompras(Array.isArray(data) ? data : []);
          setCargandoCompras(false);
        });
    }
  }, [seccion]);

  const cargarDirecciones = async () => {
    setCargandoDir(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user?section=direcciones', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDirecciones(Array.isArray(data) ? data : []);
    setCargandoDir(false);
  };

  const handleEdit = () => {
    setEditando(true);
    setMsg('');
    setError('');
  };
  const handleCancel = () => {
    setEditando(false);
    if (perfil) {
      setForm({
        nombre: perfil.nombre || '',
        apellido: perfil.apellido || '',
        rut: perfil.rut || '',
        fecha_nacimiento: perfil.fecha_nacimiento || '',
        telefono: perfil.telefono || '',
        factura: perfil.factura || false
      });
    }
    setMsg('');
    setError('');
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ 
      ...f, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  const handleSave = async (e: FormEvent) => {
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
      if (perfil) {
        setPerfil({ ...perfil, ...form });
      }
    } else {
      const data = await res.json();
      setError(data.error || 'Error actualizando datos.');
    }
  };

  // Guardar datos de facturación
  const handleSaveFact = async (e: FormEvent) => {
    e.preventDefault();
    setMsgFact(''); 
    setErrorFact('');
    // Validar campos
    for (const key of ['razon_social','rut','giro','telefono','region','comuna','calle','numero']) {
      if (!factForm[key as keyof Facturacion]) { 
        setErrorFact('Completa todos los campos obligatorios.'); 
        return; 
      }
    }
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ facturacion: factForm })
    });
    if (res.ok) {
      setMsgFact('Datos de facturación guardados.');
      setFacturacion(factForm);
      setEditandoFact(false);
    } else {
      const data = await res.json();
      setErrorFact(data.error || 'Error al guardar.');
    }
  };

  const handleFormDirChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDir((f) => ({ ...f, [name]: value }));
  };

  const handleAgregarDireccion = () => {
    setEditandoDir(null);
    setAgregandoNuevaDir(true);
    setFormDir({ 
      region: '', 
      comuna: '', 
      calle: '', 
      numero: '', 
      depto_oficina: '', 
      nombre_recibe: '', 
      apellido_recibe: '', 
      telefono_recibe: '' 
    });
    setMsgDir(''); 
    setErrorDir('');
  };

  const handleEditarDireccion = (dir: Direccion) => {
    setEditandoDir(dir);
    setFormDir({ ...dir });
    setMsgDir(''); 
    setErrorDir('');
  };

  const handleCancelarDir = () => {
    setEditandoDir(null);
    setFormDir({ 
      region: '', 
      comuna: '', 
      calle: '', 
      numero: '', 
      depto_oficina: '', 
      nombre_recibe: '', 
      apellido_recibe: '', 
      telefono_recibe: '' 
    });
    setMsgDir(''); 
    setErrorDir('');
    setAgregandoNuevaDir(false);
  };

  const handleGuardarDireccion = async (e: FormEvent) => {
    e.preventDefault();
    setMsgDir(''); 
    setErrorDir('');
    // Validar campos
    for (const key of ['region','comuna','calle','numero','nombre_recibe','apellido_recibe','telefono_recibe']) {
      if (!formDir[key as keyof typeof formDir]) { 
        setErrorDir('Completa todos los campos obligatorios.'); 
        return; 
      }
    }
    const token = localStorage.getItem('token');
    let res;
    if (agregandoNuevaDir) {
      res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formDir)
      });
    } else {
      res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ direccion: { ...formDir, id: editandoDir?.id } })
      });
    }
    const dirData = await res.json();
    if (res.ok) {
      setMsgDir('Dirección guardada correctamente.');
      setEditandoDir(null);
      cargarDirecciones();
      setAgregandoNuevaDir(false);
    } else {
      setErrorDir(dirData.error || 'Error al guardar dirección.');
    }
  };

  const handleEliminarDireccion = async (id: number) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      cargarDirecciones();
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
              {cargandoCompras ? (
                <p>Cargando compras...</p>
              ) : compras.length === 0 ? (
                <p>Aquí aparecerán tus compras realizadas.</p>
              ) : (
                <div className="space-y-6">
                  {compras.map(pedido => (
                    <div key={pedido.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="mb-2 font-semibold">Pedido #{pedido.id} - {new Date(pedido.created_at).toLocaleString()}</div>
                      <div className="mb-2">Total: <span className="font-bold">${pedido.total.toLocaleString()}</span></div>
                      <div className="mb-2">
                        <span className="font-bold">Estado:</span> {pedido.estado === 'proceso' ? 'En Proceso' : pedido.estado === 'despachado' ? 'Despachado' : pedido.estado === 'completado' ? 'Completado' : pedido.estado}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Dirección de entrega:</span> {pedido.region || ''}{pedido.comuna ? ', ' + pedido.comuna : ''}{pedido.calle ? ', ' + pedido.calle : ''}{pedido.numero ? ' #' + pedido.numero : ''}{pedido.depto_oficina ? ', ' + pedido.depto_oficina : ''}
                        {pedido.nombre_recibe || pedido.apellido_recibe || pedido.telefono_recibe ? (
                          <span> (Recibe: {pedido.nombre_recibe || ''} {pedido.apellido_recibe || ''}{pedido.telefono_recibe ? ' - ' + pedido.telefono_recibe : ''})</span>
                        ) : null}
                      </div>
                      <div>
                        <strong>Productos:</strong>
                        <ul className="list-disc ml-6">
                          {pedido.productos.map((prod, idx) => (
                            <li key={idx}>{prod.nombre} x{prod.cantidad} - ${prod.precio.toLocaleString()}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    <input name="rut" value={formatearRut(form.rut || '')} onChange={e => setForm(f => ({ ...f, rut: e.target.value.replace(/[^0-9kK]/g, '') }))} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Fecha de nacimiento</label>
                    <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento ? form.fecha_nacimiento.substring(0,10) : ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Teléfono</label>
                    <input name="telefono" value={form.telefono || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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
                  <div className="mb-2"><span className="font-bold">RUT:</span> {formatearRut(perfil.rut || '')}</div>
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
              {cargandoDir ? (
                <p>Cargando direcciones...</p>
              ) : (
                <>
                  {direcciones.length === 0 && !editandoDir && (
                    <p>No hay direcciones registradas.</p>
                  )}
                  <button className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800 transition mb-4" onClick={handleAgregarDireccion} disabled={!!editandoDir}>
                    Agregar dirección
                  </button>
                  {/* MODAL PARA AGREGAR/EDITAR DIRECCIÓN */}
                  {(agregandoNuevaDir || editandoDir) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative animate-fade-in">
                        <h4 className="text-xl font-bold mb-4">{editandoDir ? 'Editar dirección' : 'Agregar dirección'}</h4>
                        <form onSubmit={handleGuardarDireccion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <select name="region" value={formDir.region} onChange={handleFormDirChange} className="border rounded px-3 py-2" required>
                            <option value="">Selecciona una región</option>
                            {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <input name="comuna" value={formDir.comuna} onChange={handleFormDirChange} placeholder="Comuna" className="border rounded px-3 py-2" required />
                          <input name="calle" value={formDir.calle} onChange={handleFormDirChange} placeholder="Calle" className="border rounded px-3 py-2" required />
                          <input name="numero" value={formDir.numero} onChange={handleFormDirChange} placeholder="Número" className="border rounded px-3 py-2" required />
                          <input name="depto_oficina" value={formDir.depto_oficina} onChange={handleFormDirChange} placeholder="N° depto / oficina / otro dato (si aplica)" className="border rounded px-3 py-2 md:col-span-2" />
                          <input name="nombre_recibe" value={formDir.nombre_recibe} onChange={handleFormDirChange} placeholder="Nombre de quien recibe" className="border rounded px-3 py-2" required />
                          <input name="apellido_recibe" value={formDir.apellido_recibe} onChange={handleFormDirChange} placeholder="Apellido de quien recibe" className="border rounded px-3 py-2" required />
                          <input name="telefono_recibe" value={formDir.telefono_recibe} onChange={handleFormDirChange} placeholder="Teléfono" className="border rounded px-3 py-2" required />
                          {errorDir && <div className="text-red-600 text-sm md:col-span-2">{errorDir}</div>}
                          {msgDir && <div className="text-green-600 text-sm md:col-span-2">{msgDir}</div>}
                          <div className="flex gap-4 mt-2 md:col-span-2">
                            <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800 transition">Guardar</button>
                            <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300 transition" onClick={handleCancelarDir}>Cancelar</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {direcciones.map(dir => (
                      <div key={dir.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between border">
                        <div>
                          <div><span className="font-bold">{dir.region}</span>, {dir.comuna}, {dir.calle} #{dir.numero} {dir.depto_oficina && `, ${dir.depto_oficina}`}</div>
                          <div className="text-sm text-gray-600">Recibe: {dir.nombre_recibe} {dir.apellido_recibe} - {dir.telefono_recibe}</div>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <button className="text-blue-700 hover:underline text-sm" onClick={()=>handleEditarDireccion(dir)}>Editar</button>
                          <button className="text-red-600 hover:underline text-sm" onClick={()=>handleEliminarDireccion(dir.id)}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {seccion === 'facturacion' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Datos de facturación</h3>
              {editandoFact ? (
                <form onSubmit={handleSaveFact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="razon_social" value={factForm.razon_social} onChange={e => setFactForm((f) => ({...f, razon_social: e.target.value}))} placeholder="Razón social" className="border rounded px-3 py-2" required />
                  <input name="rut" value={formatearRut(factForm.rut || '')} onChange={e => setFactForm(f => ({...f, rut: e.target.value.replace(/[^0-9kK]/g, '')}))} placeholder="RUT" className="border rounded px-3 py-2" required />
                  <input name="giro" value={factForm.giro} onChange={e => setFactForm((f) => ({...f, giro: e.target.value}))} placeholder="Giro del negocio" className="border rounded px-3 py-2" required />
                  <input name="telefono" value={factForm.telefono} onChange={e => setFactForm((f) => ({...f, telefono: e.target.value}))} placeholder="Teléfono" className="border rounded px-3 py-2" required />
                  <select name="region" value={factForm.region} onChange={e => setFactForm((f) => ({...f, region: e.target.value}))} className="border rounded px-3 py-2" required>
                    <option value="">Selecciona una región</option>
                    {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input name="comuna" value={factForm.comuna} onChange={e => setFactForm((f) => ({...f, comuna: e.target.value}))} placeholder="Comuna" className="border rounded px-3 py-2" required />
                  <input name="calle" value={factForm.calle} onChange={e => setFactForm((f) => ({...f, calle: e.target.value}))} placeholder="Calle" className="border rounded px-3 py-2" required />
                  <input name="numero" value={factForm.numero} onChange={e => setFactForm((f) => ({...f, numero: e.target.value}))} placeholder="Número" className="border rounded px-3 py-2" required />
                  <input name="depto_oficina" value={factForm.depto_oficina || ""} onChange={e => setFactForm((f) => ({...f, depto_oficina: e.target.value}))} placeholder="N° depto / oficina / otro dato (si aplica)" className="border rounded px-3 py-2 md:col-span-2" />
                  {errorFact && <div className="text-red-600 text-sm md:col-span-2">{errorFact}</div>}
                  {msgFact && <div className="text-green-600 text-sm md:col-span-2">{msgFact}</div>}
                  <div className="flex gap-4 mt-2 md:col-span-2">
                    <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800 transition">Guardar</button>
                    <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300 transition" onClick={()=>setEditandoFact(false)}>Cancelar</button>
                  </div>
                </form>
              ) : facturacion ? (
                <div>
                  <div className="mb-2"><span className="font-bold">Razón social:</span> {facturacion.razon_social}</div>
                  <div className="mb-2"><span className="font-bold">RUT:</span> {formatearRut(facturacion.rut)}</div>
                  <div className="mb-2"><span className="font-bold">Giro:</span> {facturacion.giro}</div>
                  <div className="mb-2"><span className="font-bold">Teléfono:</span> {facturacion.telefono}</div>
                  <div className="mb-2"><span className="font-bold">Región:</span> {facturacion.region}</div>
                  <div className="mb-2"><span className="font-bold">Comuna:</span> {facturacion.comuna}</div>
                  <div className="mb-2"><span className="font-bold">Calle:</span> {facturacion.calle}</div>
                  <div className="mb-2"><span className="font-bold">Número:</span> {facturacion.numero}</div>
                  <div className="mb-2"><span className="font-bold">Depto/Oficina:</span> {facturacion.depto_oficina}</div>
                  <button className="mt-4 text-blue-700 hover:underline text-sm" onClick={()=>setEditandoFact(true)}>Editar &gt;</button>
                </div>
              ) : (
                <p>No tienes datos de facturación guardados.</p>
              )}
            </div>
          )}
          {seccion === 'contrasena' && (
            <div>
              <h3 className="text-2xl font-bold mb-4">Contraseña</h3>
              <CambioContrasena />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CambioContrasena() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!actual || !nueva || !confirmar) {
      setError('Completa todos los campos.');
      return;
    }
    if (nueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ oldPassword: actual, newPassword: nueva })
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setMsg('Contraseña cambiada correctamente.');
      setActual(''); setNueva(''); setConfirmar('');
    } else {
      setError(data.error || 'Error al cambiar la contraseña.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-semibold">Contraseña actual</label>
        <input type="password" value={actual} onChange={e => setActual(e.target.value)} className="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm font-semibold">Nueva contraseña</label>
        <input type="password" value={nueva} onChange={e => setNueva(e.target.value)} className="w-full border rounded px-3 py-2" required minLength={6} />
      </div>
      <div>
        <label className="block text-sm font-semibold">Confirmar nueva contraseña</label>
        <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} className="w-full border rounded px-3 py-2" required minLength={6} />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {msg && <div className="text-green-600 text-sm">{msg}</div>}
      <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800 transition" disabled={loading}>
        {loading ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
} 