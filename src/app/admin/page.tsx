"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';

const USER = "admin";
const PASS = "admin123";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
}

interface ImagenGaleria {
  id: number;
  imagen: string;
  titulo?: string;
}
interface EnlaceRed {
  id: number;
  url: string;
  titulo?: string;
}

interface UsuarioResumen {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  factura: boolean;
  direccion?: {
    region: string;
    comuna: string;
    calle: string;
    numero: string;
  } | null;
}

function AdminGaleria() {
  const [imagenes, setImagenes] = useState<ImagenGaleria[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGaleria();
  }, []);

  const fetchGaleria = async () => {
    const res = await fetch('/api/galeria');
    const data = await res.json();
    setImagenes(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('imagen', file);
    const res = await fetch('/api/galeria', {
      method: 'POST',
      body: formData,
    });
    setLoading(false);
    setFile(null);
    setPreview(null);
    if (res.ok) fetchGaleria();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    await fetch(`/api/galeria?id=${id}`, { method: 'DELETE' });
    fetchGaleria();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Administrar Galería</h2>
      <form onSubmit={handleUpload} className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {preview && (
          <Image src={preview} alt="Previsualización" width={80} height={80} className="w-20 h-20 object-cover rounded border" />
        )}
        <button
          type="submit"
          disabled={loading || !file}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? 'Subiendo...' : 'Subir Imagen'}
        </button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.isArray(imagenes) && imagenes.map((img) => (
          <div key={img.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
            <Image src={img.imagen} alt={img.titulo || 'Imagen galería'} width={100} height={100} className="w-24 h-24 object-cover rounded mb-2" />
            <div className="text-sm text-center">{img.titulo}</div>
            <button
              onClick={() => handleDelete(img.id)}
              className="mt-2 text-red-600 hover:underline text-xs"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminRedes() {
  const [enlaces, setEnlaces] = useState<EnlaceRed[]>([]);
  const [url, setUrl] = useState('');
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState<'url' | 'embed'>('url');

  useEffect(() => {
    fetchRedes();
  }, []);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidEmbedCode = (code: string) => {
    return code.includes('<iframe') || code.includes('class="fb-post"') || code.includes('class="instagram-media"');
  };

  const fetchRedes = async () => {
    const res = await fetch('/api/redes');
    const data = await res.json();
    setEnlaces(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Por favor ingresa un enlace o código embed.');
      return;
    }

    if (tipo === 'url') {
      if (!isValidUrl(url)) {
        setError('Por favor ingresa una URL válida.');
        return;
      }
    } else {
      if (!isValidEmbedCode(url)) {
        setError('Por favor ingresa un código embed válido (debe contener iframe o class="fb-post" o class="instagram-media").');
        return;
      }
    }

    setLoading(true);
    const res = await fetch('/api/redes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim(), titulo: titulo.trim() }),
    });
    setLoading(false);
    
    if (res.ok) {
      setUrl('');
      setTitulo('');
      fetchRedes();
    } else {
      setError('Error al agregar el enlace. Inténtalo de nuevo.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este enlace?')) return;
    await fetch(`/api/redes?id=${id}`, { method: 'DELETE' });
    fetchRedes();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Administrar Redes Sociales</h2>
      
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instrucciones para agregar contenido de redes sociales:</h3>
        
        <div className="space-y-3 text-sm text-blue-700">
          <div>
            <strong>Para Instagram:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Ve al post de Instagram</li>
              <li>• Haz clic en &quot;Compartir&quot; → &quot;Insertar&quot;</li>
              <li>• Copia el código que aparece</li>
              <li>• Pégalo en el campo de abajo</li>
            </ul>
          </div>
          
          <div>
            <strong>Para Facebook:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Ve al post de Facebook</li>
              <li>• Haz clic en los 3 puntos (...) → &quot;Insertar&quot;</li>
              <li>• Copia el código que aparece</li>
              <li>• Pégalo en el campo de abajo</li>
            </ul>
          </div>
          
          <div>
            <strong>Para YouTube:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Ve al video de YouTube</li>
              <li>• Haz clic en &quot;Compartir&quot; → &quot;Insertar&quot;</li>
              <li>• Copia el código iframe</li>
              <li>• Pégalo en el campo de abajo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleAdd} className="space-y-4 mb-6">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tipo"
              value="url"
              checked={tipo === 'url'}
              onChange={() => setTipo('url')}
              className="mr-2"
            />
            URL simple
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tipo"
              value="embed"
              checked={tipo === 'embed'}
              onChange={() => setTipo('embed')}
              className="mr-2"
            />
            Código embed
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              {tipo === 'url' ? 'URL de la red social:' : 'Código embed:'}
            </label>
            <textarea
              placeholder={tipo === 'url' 
                ? 'https://www.instagram.com/p/CODIGO/' 
                : '<div class="fb-post" data-href="...">...</div>'
              }
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Título (opcional):</label>
            <input
              type="text"
              placeholder="Ej: Post de Instagram - Productos nuevos"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Agregando...' : 'Agregar Enlace'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Lista de enlaces */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Enlaces actuales:</h3>
        {enlaces.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay enlaces agregados aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enlaces.map((enlace) => (
              <div key={enlace.id} className="border rounded p-3 bg-gray-50">
                <div className="text-sm font-medium mb-1">{enlace.titulo || 'Sin título'}</div>
                <div className="text-xs text-gray-600 mb-2 break-all">
                  {enlace.url.length > 100 ? enlace.url.substring(0, 100) + '...' : enlace.url}
                </div>
                <button
                  onClick={() => handleDelete(enlace.id)}
                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
    imagen: "",
    file: null as File | null,
  });
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Estado para usuarios
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  useEffect(() => {
    if (autenticado) cargarProductos();
    if (autenticado) cargarUsuarios();
  }, [autenticado]);

  async function cargarProductos() {
    setCargando(true);
    const res = await fetch("/api/productos");
    const data = await res.json();
    setProductos(data);
    setCargando(false);
  }

  async function cargarUsuarios() {
    setCargandoUsuarios(true);
    const res = await fetch('/api/user?section=all');
    const data = await res.json();
    setUsuarios(Array.isArray(data) ? data : []);
    setCargandoUsuarios(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === USER && contrasena === PASS) {
      setAutenticado(true);
      setError("");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === "number" ? Number(value) : value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, file, imagen: file ? '' : f.imagen })); // Limpiar link si se sube archivo
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    let imagen = form.imagen;
    if (form.file) {
      // Subir la imagen al endpoint /api/upload
      const data = new FormData();
      data.append('file', form.file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.url) {
        imagen = result.url;
      }
    }
    const body = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: form.precio,
      imagen,
    };
    if (editando) {
      await fetch("/api/productos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, id: form.id }),
      });
      setMensaje("¡Producto editado con éxito!");
    } else {
      await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setMensaje("¡Producto añadido con éxito!");
    }
    setForm({ id: 0, nombre: "", descripcion: "", precio: 0, imagen: "", file: null });
    setEditando(false);
    cargarProductos();
    setCargando(false);
    setTimeout(() => setMensaje(""), 2000);
  }

  function handleEditar(producto: Producto) {
    setForm({
      ...producto,
      descripcion: producto.descripcion ?? "",
      imagen: producto.imagen ?? "",
      file: null
    });
    setEditando(true);
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    setCargando(true);
    await fetch("/api/productos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    cargarProductos();
    setCargando(false);
    setMensaje("¡Producto eliminado con éxito!");
    setTimeout(() => setMensaje(""), 2000);
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
          <h2 className="text-2xl font-bold mb-6 text-center">Panel de Administración</h2>
          <div className="mb-4">
            <label className="block mb-1">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Contenedor de Productos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Administrar Productos</h2>
        {mensaje && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded text-center font-semibold animate-fade-in">
            {mensaje}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-8 max-w-xl">
          <h3 className="text-lg font-semibold mb-4">{editando ? "Editar producto" : "Nuevo producto"}</h3>
          <div className="mb-3">
            <label className="block mb-1">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleFormChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleFormChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Precio</label>
            <input name="precio" type="number" value={form.precio} onChange={handleFormChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Imagen (URL)</label>
            <input name="imagen" value={form.imagen} onChange={handleFormChange} className="w-full border px-3 py-2 rounded" placeholder="https://..." disabled={!!form.file} />
          </div>
          <div className="mb-3">
            <label className="block mb-1">O subir imagen local</label>
            <div className="flex items-center gap-3 p-3 border-2 border-dashed border-green-400 bg-green-50 rounded">
              <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700 transition font-semibold">
                Seleccionar archivo
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {form.file && <span className="text-green-800 text-sm font-medium">{form.file.name}</span>}
            </div>
          </div>
          {/* Previsualización de la imagen actual */}
          {(form.imagen || form.file) && (
            <div className="mb-3 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Previsualización:</span>
              <div className="relative w-32 h-32 border rounded overflow-hidden bg-gray-100">
                <Image
                  src={form.file ? URL.createObjectURL(form.file) : form.imagen || '/placeholder.png'}
                  alt="Previsualización"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition" disabled={cargando}>{editando ? "Actualizar" : "Crear"}</button>
          {editando && (
            <button type="button" className="ml-2 px-4 py-2 rounded border" onClick={() => { setEditando(false); setForm({ id: 0, nombre: "", descripcion: "", precio: 0, imagen: "", file: null }); }}>Cancelar</button>
          )}
        </form>
        <h3 className="text-lg font-semibold mb-4">Productos</h3>
        {cargando ? <p>Cargando...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map(producto => (
              <div key={producto.id} className="bg-white rounded shadow p-4 flex flex-col">
                {producto.imagen && (
                  <Image src={producto.imagen} alt={producto.nombre} width={400} height={192} className="w-full h-48 object-cover mb-2 rounded" />
                )}
                <h4 className="font-bold text-lg">{producto.nombre}</h4>
                <p className="text-gray-600">{producto.descripcion}</p>
                <p className="text-green-700 font-semibold mt-2">${producto.precio}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleEditar(producto)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                  <button onClick={() => handleEliminar(producto.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Contenedor de Galería */}
      <AdminGaleria />
      {/* Contenedor de Redes Sociales */}
      <AdminRedes />
      {/* Tabla de usuarios registrados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Usuarios registrados</h2>
        {cargandoUsuarios ? (
          <p>Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Nombre</th>
                  <th className="p-2 border">RUT</th>
                  <th className="p-2 border">Correo</th>
                  <th className="p-2 border">Factura</th>
                  <th className="p-2 border">Dirección</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u: UsuarioResumen) => (
                  <tr key={u.id}>
                    <td className="p-2 border">{u.nombre} {u.apellido}</td>
                    <td className="p-2 border">{u.rut}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border text-center">{u.factura ? 'Sí' : 'No'}</td>
                    <td className="p-2 border text-center">
                      {u.direccion ? (
                        <span>{u.direccion.region}, {u.direccion.comuna}, {u.direccion.calle} #{u.direccion.numero}</span>
                      ) : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 