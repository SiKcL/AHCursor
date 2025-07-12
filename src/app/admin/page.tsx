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

  useEffect(() => {
    if (autenticado) cargarProductos();
  }, [autenticado]);

  async function cargarProductos() {
    setCargando(true);
    const res = await fetch("/api/productos");
    const data = await res.json();
    setProductos(data);
    setCargando(false);
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
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-2xl font-bold mb-6">Panel de Administración</h2>
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
  );
} 