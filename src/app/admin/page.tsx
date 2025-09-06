"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from 'react-modal';

// Configurar el appElement para react-modal
if (typeof window !== 'undefined') {
  Modal.setAppElement(document.body);
}

// 1. Actualizar la interfaz Producto para incluir stock y descuentos
interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
  stock: number;
  descuentos?: { tipo: 'general' | 'por_cantidad', items: { min: number, precio?: number; porcentaje?: number }[] } | null;
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

// 1. Extender la interfaz UsuarioResumen para incluir pedidos_realizados
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
  telefono?: string;
  pedidos_realizados?: number;
  rol?: string; // Added rol to the interface
  last_login?: string; // Added last_login to the interface
}

// 1. Definir la interfaz para los pedidos y productos del pedido
interface PedidoAdmin {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_apellido: string;
  direccion: string;
  total: number;
  created_at: string;
  estado: string;
  productos: { nombre: string; cantidad: number; precio: number }[];
  telefono_recibe?: string;
  external_id?: string;
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

interface FaqItem {
  id: number;
  pregunta: string;
  respuesta: string;
  imagen_fondo: string;
  orden: number;
}

function AdminFAQs() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [imagenFondo, setImagenFondo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [orden, setOrden] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<FaqItem | null>(null);
  const [mensaje, setMensaje] = useState('');

  const fetchFaqs = async () => {
    const res = await fetch('/api/faqs');
    const data = await res.json();
    setFaqs(data);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregunta.trim() || !respuesta.trim()) {
      setError('Pregunta y respuesta son requeridos');
      return;
    }

    if (!editando && !file) {
      setError('Debe seleccionar una imagen');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imagenFinal = imagenFondo;
      
      // Si hay un archivo nuevo, subirlo
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (uploadResult.url) {
          imagenFinal = uploadResult.url;
        } else {
          setError('Error al subir la imagen');
          setLoading(false);
          return;
        }
      }

      const method = editando ? 'PUT' : 'POST';
      const body = {
        ...(editando && { id: editando.id }),
        pregunta: pregunta.trim(),
        respuesta: respuesta.trim(),
        imagen_fondo: imagenFinal,
        orden: orden
      };

      const res = await fetch('/api/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMensaje(editando ? 'Pregunta actualizada con éxito' : 'Pregunta agregada con éxito');
        setPregunta('');
        setRespuesta('');
        setImagenFondo('');
        setFile(null);
        setPreview(null);
        setOrden(1);
        setEditando(null);
        fetchFaqs();
      } else {
        setError('Error al guardar la pregunta');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq: FaqItem) => {
    setPregunta(faq.pregunta);
    setRespuesta(faq.respuesta);
    setImagenFondo(faq.imagen_fondo);
    setOrden(faq.orden);
    setEditando(faq);
    setFile(null);
    setPreview(null);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta pregunta frecuente?')) return;
    
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMensaje('Pregunta eliminada con éxito');
        fetchFaqs();
      } else {
        setError('Error al eliminar la pregunta');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  const cancelarEdicion = () => {
    setPregunta('');
    setRespuesta('');
    setImagenFondo('');
    setFile(null);
    setPreview(null);
    setOrden(1);
    setEditando(null);
    setError('');
  };

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Administrar Preguntas Frecuentes</h2>
      
      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded text-center font-semibold">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-center font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pregunta:</label>
            <input
              type="text"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: ¿Tengo que desinfectar los productos?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Orden de visualización:</label>
            <input
              type="number"
              value={orden}
              onChange={(e) => setOrden(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min="1"
              max={faqs.length + 1}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {editando 
                ? `Actual: ${editando.orden}. Los demás se reorganizarán automáticamente.`
                : `Máximo: ${faqs.length + 1}. Los existentes se reorganizarán automáticamente.`
              }
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Respuesta:</label>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            className="w-full border rounded px-3 py-2 h-20"
            placeholder="Escribe la respuesta aquí..."
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Imagen de fondo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
              <img src={preview} alt="Vista previa" className="w-32 h-20 object-cover rounded border" />
            </div>
          )}
          {editando && !file && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
              <img src={imagenFondo} alt="Imagen actual" className="w-32 h-20 object-cover rounded border" />
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar'} Pregunta
          </button>
          {editando && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preguntas existentes:</h3>
        {faqs.length === 0 ? (
          <p className="text-gray-500">No hay preguntas frecuentes registradas.</p>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Orden: {faq.orden}
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{faq.pregunta}</h4>
                  <p className="text-gray-700 mb-2">{faq.respuesta}</p>
                  <div className="flex items-center gap-4">
                    <img src={faq.imagen_fondo} alt="Imagen FAQ" className="w-20 h-12 object-cover rounded border" />
                    <p className="text-sm text-gray-500">
                      <strong>Imagen:</strong> {faq.imagen_fondo}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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

function descargarPDF(pedidos: PedidoAdmin[], titulo: string) {
  const doc = new jsPDF('landscape'); // Cambiar a orientación horizontal para mejor distribución
  
  // Configurar fuente y título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 14, 20);
  
  // Configurar tabla con mejor formato
  autoTable(doc, {
    startY: 30,
    head: [[
      'ID', 'ID Externo', 'Cliente', 'Teléfono', 'Dirección', 'Productos', 'Total', 'Fecha', 'Estado'
    ]],
    body: pedidos.map(p => [
      p.id.toString(),
      p.external_id || '-',
      `${p.usuario_nombre} ${p.usuario_apellido}`,
      p.telefono_recibe || '-',
      p.direccion,
      p.productos.map(prod => `${prod.nombre} x${prod.cantidad} ($${prod.precio})`).join(' | '),
      `$${p.total}`,
      new Date(p.created_at).toLocaleDateString('es-CL') + '\n' + new Date(p.created_at).toLocaleTimeString('es-CL'),
      p.estado.charAt(0).toUpperCase() + p.estado.slice(1)
    ]),
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      valign: 'middle',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // ID
      1: { cellWidth: 30, halign: 'center' }, // ID Externo
      2: { cellWidth: 35, halign: 'left' },   // Cliente
      3: { cellWidth: 22, halign: 'center' }, // Teléfono
      4: { cellWidth: 40, halign: 'left' },   // Dirección
      5: { cellWidth: 50, halign: 'left' },   // Productos
      6: { cellWidth: 22, halign: 'center' }, // Total
      7: { cellWidth: 30, halign: 'center' }, // Fecha
      8: { cellWidth: 20, halign: 'center' }  // Estado
    },
    margin: { top: 30, right: 14, bottom: 20, left: 14 },
    didDrawPage: function () {
      // Agregar numeración de páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
    }
  });
  
  doc.save(`${titulo.replace(/ /g, '_').toLowerCase()}_${new Date().toISOString().slice(0,10)}.pdf`);
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  // 2. Agregar stock al estado del formulario
  const [form, setForm] = useState({
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
    imagen: "",
    file: null as File | null,
    stock: 0,
    tieneDescuento: false,
    descuentos: null as { tipo: 'general' | 'por_cantidad'; items: { min: number; precio?: number; porcentaje?: number }[] } | null,
    descuentoGeneral: 0,
  });
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");

  // Estado para usuarios
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [mensajeUsuario, setMensajeUsuario] = useState("");

  // Estado para pedidos
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // 2. Estado para el modal de pedidos de usuario
  const [modalPedidos, setModalPedidos] = useState<{visible: boolean, usuario?: UsuarioResumen, pedidos: PedidoAdmin[]}>({visible: false, usuario: undefined, pedidos: []});

  const [modalCrearAdmin, setModalCrearAdmin] = useState(false);
  const [nuevoAdmin, setNuevoAdmin] = useState({ nombre: '', apellido: '', email: '', password: '' });
  const [mensajeAdmin, setMensajeAdmin] = useState('');

  // Estados para modales de pedidos
  const [modalCrearPedido, setModalCrearPedido] = useState(false);
  const [modalEditarPedido, setModalEditarPedido] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoAdmin | null>(null);
  const [formPedido, setFormPedido] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    external_id: '',
    productos: [] as { id: number; nombre: string; cantidad: number; precio: number }[]
  });

  const [formPedidoNuevo, setFormPedidoNuevo] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    productos: [] as { id: number; nombre: string; cantidad: number; precio: number }[]
  });

  // Función para calcular precio con descuentos
  const calcularPrecioConDescuento = (producto: Producto, cantidad: number): number => {
    if (!producto.descuentos) {
      return producto.precio;
    }
    
    if (producto.descuentos.tipo === 'general') {
      // Descuento general (porcentaje)
      const descuentoGeneral = producto.descuentos.items[0]?.porcentaje || 0;
      return producto.precio * (1 - descuentoGeneral / 100);
    } else if (producto.descuentos.tipo === 'por_cantidad') {
      // Descuento por volumen
      const descuentosOrdenados = [...producto.descuentos.items].sort((a, b) => b.min - a.min);
      
      for (const descuento of descuentosOrdenados) {
        if (cantidad >= descuento.min && descuento.precio !== undefined) {
          return descuento.precio;
        }
      }
    }
    
    return producto.precio;
  };



  interface Facturacion {
    razon_social: string;
    rut: string;
    giro: string;
    telefono: string;
    region: string;
    comuna: string;
    calle: string;
    numero: string;
    depto_oficina: string;
  }
  const [modalFactura, setModalFactura] = useState<{open: boolean, data: Facturacion | null}>({open: false, data: null});

  useEffect(() => {
    if (autenticado) cargarPedidos();
    if (autenticado) cargarProductos();
    if (autenticado) cargarUsuarios();
  }, [autenticado]);

  // Mensajes efímeros de éxito
  useEffect(() => {
    if (mensajeOk) {
      const t = setTimeout(() => setMensajeOk(''), 2000);
      return () => clearTimeout(t);
    }
  }, [mensajeOk]);

  async function cargarProductos() {
    setCargando(true);
    const res = await fetch("/api/productos");
    const data = await res.json();
    setProductos(data);
    setProductosFiltrados(data);
    setCargando(false);
  }

  // Filtrar productos cuando cambie el término de búsqueda
  useEffect(() => {
    if (terminoBusqueda.trim() === '') {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  }, [terminoBusqueda, productos]);

  async function cargarUsuarios() {
    setCargandoUsuarios(true);
    const res = await fetch('/api/user?section=all');
    const data = await res.json();
    setUsuarios(Array.isArray(data) ? data : []);
    setCargandoUsuarios(false);
  }

  async function cargarPedidos() {
    setCargandoPedidos(true);
    const token = localStorage.getItem('token');
    let res: Response;
    if (token) {
      res = await fetch('/api/pedidos?admin=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      res = await fetch('/api/pedidos?admin=1');
    }
    const data = await res.json();
    setPedidos(Array.isArray(data) ? data : []);
    setCargandoPedidos(false);
  }

  async function cargarPedidosUsuario(userId: number) {
    const res = await fetch(`/api/user?section=orders&user_id=${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    });
    const data = await res.json();
    setModalPedidos(m => ({...m, pedidos: Array.isArray(data) ? data : []}));
  }

  async function handleEliminarUsuario(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.")) return;
    setCargandoUsuarios(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: id }),
      });
      if (res.ok) {
        setMensajeUsuario("¡Usuario eliminado con éxito!");
        cargarUsuarios();
      } else {
        setMensajeUsuario("Error al eliminar usuario.");
      }
    } catch {
      setMensajeUsuario("Error al eliminar usuario.");
    }
    setCargandoUsuarios(false);
    setTimeout(() => setMensajeUsuario(""), 2000);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Login contra la API
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: usuario, password: contrasena })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Usuario o contraseña incorrectos");
        return;
      }
      if (data.user.rol !== "admin") {
        setError("No tienes permisos de administrador");
        return;
      }
      localStorage.setItem("token", data.token);
      setAutenticado(true);
      setError("");
    } catch {
      setError("Error de conexión o login");
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
      stock: form.stock,
      descuentos: form.descuentos,
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
    setForm({ id: 0, nombre: "", descripcion: "", precio: 0, imagen: "", file: null, stock: 0, tieneDescuento: false, descuentos: null, descuentoGeneral: 0 });
    setEditando(false);
    cargarProductos();
    setCargando(false);
    setTimeout(() => setMensaje(""), 2000);
  }

  function handleEditar(producto: Producto) {
    setForm({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      precio: producto.precio,
      imagen: producto.imagen ?? "",
      file: null,
      stock: producto.stock ?? 0,
      tieneDescuento: !!producto.descuentos,
      descuentos: producto.descuentos ?? null,
      descuentoGeneral: producto.descuentos?.tipo === 'general' ? producto.descuentos.items[0]?.precio || 0 : 0,
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

  // Función para formatear RUT chileno
  function formatearRut(rut: string): string {
    if (!rut) return '';
    // Eliminar puntos y guiones
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

  // useEffect para cargar los pedidos del usuario cuando se abre el modal
  useEffect(() => {
    if (modalPedidos.visible && modalPedidos.usuario) {
      cargarPedidosUsuario(modalPedidos.usuario.id);
    }
  }, [modalPedidos.visible, modalPedidos.usuario]);

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

  // Filtrar pedidos
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');
  const pedidosCancelados = pedidos.filter(p => p.estado === 'cancelado');
  const pedidosNoCompletados = pedidos.filter(p => p.estado !== 'completado' && p.estado !== 'cancelado');

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
          <div className="mb-3">
            <label className="block mb-1">Stock</label>
            <input name="stock" type="number" value={form.stock} onChange={handleFormChange} className="w-full border px-3 py-2 rounded" min={0} required />
          </div>
          {/* Mostrar sección de descuentos solo al editar */}
          {editando && (
            <>
              <div className="mb-3">
                <label className="block mb-1">¿Tiene descuento por volumen?</label>
                <input
                  type="checkbox"
                  checked={form.tieneDescuento}
                  onChange={e => setForm(f => ({ ...f, tieneDescuento: e.target.checked, descuentos: e.target.checked ? { tipo: 'por_cantidad', items: [] } : null }))}
                />
              </div>
              {form.tieneDescuento && (
                <div className="mb-3 border rounded p-3 bg-blue-50">
                  <label className="block mb-1 font-semibold">Tipo de descuento:</label>
                  <select
                    value={form.descuentos?.tipo || 'por_cantidad'}
                    onChange={e => setForm(f => ({ ...f, descuentos: { ...f.descuentos!, tipo: e.target.value as 'general' | 'por_cantidad', items: f.descuentos?.items || [] } }))}
                    className="border rounded px-2 py-1 mb-2"
                  >
                    <option value="por_cantidad">Por cantidad</option>
                    <option value="general">Descuento general</option>
                  </select>
                  {form.descuentos?.tipo === 'general' ? (
                    <div>
                      <label className="block mb-1">% de descuento general:</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={form.descuentoGeneral}
                        onChange={e => setForm(f => ({ ...f, descuentoGeneral: Number(e.target.value), descuentos: { ...f.descuentos!, items: [{ min: 1, porcentaje: Number(e.target.value) }] } }))}
                        className="border rounded px-2 py-1"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  ) : (
                    <div>
                      <label className="block mb-1">Descuentos por cantidad:</label>
                      {(form.descuentos?.items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <span>Desde</span>
                          <input
                            type="number"
                            value={item.min}
                            min={1}
                            onChange={e => setForm(f => ({
                              ...f,
                              descuentos: {
                                ...f.descuentos!,
                                items: f.descuentos!.items.map((it, i) => i === idx ? { ...it, min: Number(e.target.value) } : it)
                              }
                            }))}
                            className="border rounded px-2 py-1 w-20"
                          />
                          <span>unidades →</span>
                          <input
                            type="number"
                            value={item.precio}
                            min={1}
                            onChange={e => setForm(f => ({
                              ...f,
                              descuentos: {
                                ...f.descuentos!,
                                items: f.descuentos!.items.map((it, i) => i === idx ? { ...it, precio: Number(e.target.value) } : it)
                              }
                            }))}
                            className="border rounded px-2 py-1 w-24"
                          />
                          <span>precio asignado</span>
                          <button type="button" className="text-red-600 ml-2" onClick={() => setForm(f => ({
                            ...f,
                            descuentos: {
                              ...f.descuentos!,
                              items: f.descuentos!.items.filter((_, i) => i !== idx)
                            }
                          }))}>Eliminar</button>
                        </div>
                      ))}
                      <button type="button" className="bg-blue-600 text-white px-3 py-1 rounded mt-2" onClick={() => setForm(f => ({
                        ...f,
                        descuentos: {
                          ...f.descuentos!,
                          items: [...(f.descuentos?.items || []), { min: 1, precio: 1 }]
                        }
                      }))}>Añadir precio por volumen</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition" disabled={cargando}>{editando ? "Actualizar" : "Crear"}</button>
          {editando && (
            <button type="button" className="ml-2 px-4 py-2 rounded border" onClick={() => { setEditando(false); setForm({ id: 0, nombre: "", descripcion: "", precio: 0, imagen: "", file: null, stock: 0, tieneDescuento: false, descuentos: null, descuentoGeneral: 0 }); }}>Cancelar</button>
          )}
        </form>
        
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos por nombre"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {terminoBusqueda && (
                <button
                  onClick={() => setTerminoBusqueda('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {terminoBusqueda && (
              <p className="mt-2 text-sm text-gray-600">
                {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Productos</h3>
        {cargando ? <p>Cargando...</p> : productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {productosFiltrados.map(producto => {
              let badge = null;
              if (producto.descuentos) {
                if (producto.descuentos.tipo === 'general' && producto.descuentos.items.length > 0) {
                  const porcentaje = producto.descuentos.items[0]?.porcentaje;
                  badge = (
                    <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                      -{typeof porcentaje === 'number' && !isNaN(porcentaje) ? porcentaje : 0}% Descuento
                    </span>
                  );
                } else if (producto.descuentos.tipo === 'por_cantidad' && producto.descuentos.items.length > 0) {
                  badge = (
                    <span className="absolute top-2 right-2 flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                      <Image src="/porcentaje.png" alt="%" width={12} height={12} className="w-3 h-3" />
                      Descuento por Volumen
                    </span>
                  );
                }
              }
              return (
                <div key={producto.id} className="group">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col relative">
                    {/* Badge de descuento */}
                    {badge}
                    <div className="relative w-full aspect-[4/5] bg-gray-100">
                      <Image
                        src={producto.imagen || '/placeholder.png'}
                        alt={`Imagen de ${producto.nombre}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 text-center flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-md font-semibold text-gray-800">{producto.nombre}</h3>
                        {/* Mostrar precio original tachado si hay descuento */}
                        {producto.descuentos && producto.descuentos.tipo === 'por_cantidad' && producto.descuentos.items.length > 0 ? (
                          <p className="text-lg font-bold text-green-600 mt-1">${producto.precio}</p>
                        ) : producto.descuentos && producto.descuentos.tipo === 'general' && producto.descuentos.items.length > 0 ? (
                          <>
                            <p className="text-sm text-gray-400 line-through">${producto.precio}</p>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              {(() => {
                                const porcentaje = producto.descuentos.items[0]?.porcentaje;
                                if (typeof porcentaje === 'number' && !isNaN(porcentaje)) {
                                  return `$${Math.round(producto.precio * (1 - porcentaje / 100))}`;
                                }
                                return `$${producto.precio}`;
                              })()}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-green-600 mt-1">${producto.precio}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Stock: {producto.stock}</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => handleEditar(producto)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                        <button onClick={() => handleEliminar(producto.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : terminoBusqueda ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No se encontraron productos que coincidan con &quot;{terminoBusqueda}&quot;</p>
            <button
              onClick={() => setTerminoBusqueda('')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay productos registrados.</p>
          </div>
        )}
      </div>
      {/* Contenedor de Galería */}
      <AdminGaleria />
      {/* Contenedor de Redes Sociales */}
      <AdminRedes />
      {/* Contenedor de Preguntas Frecuentes */}
      <AdminFAQs />
      {/* Tabla de usuarios registrados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Usuarios registrados</h2>
        {mensajeUsuario && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded text-center font-semibold animate-fade-in">
            {mensajeUsuario}
          </div>
        )}
        {cargandoUsuarios ? (
          <p>Cargando usuarios...</p>
        ) : usuarios.filter(u => u.rol !== 'admin').length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Nombre</th>
                  <th className="p-2 border">RUT</th>
                  <th className="p-2 border">Correo</th>
                  <th className="p-2 border">Teléfono</th>
                  <th className="p-2 border">Factura</th>
                  <th className="p-2 border">Dirección</th>
                  <th className="p-2 border">Pedidos Realizados</th>
                  <th className="p-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.filter(u => u.rol !== 'admin').map((u: UsuarioResumen) => (
                  <tr key={u.id}>
                    <td className="p-2 border">{u.nombre} {u.apellido}</td>
                    <td className="p-2 border">{formatearRut(u.rut)}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.telefono || '-'}</td>
                    <td className="p-2 border text-center">
                      {u.factura ? (
                        <button
                          className="text-green-700 underline font-bold cursor-pointer"
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`/api/user?section=facturacion&user_id=${u.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                            const data = await res.json();
                            setModalFactura({open: true, data});
                          }}
                        >
                          Sí
                        </button>
                      ) : 'No'}
                    </td>
                    <td className="p-2 border text-center">
                      {u.direccion ? (
                        <span>{u.direccion.region}, {u.direccion.comuna}, {u.direccion.calle} #{u.direccion.numero}</span>
                      ) : 'No'}
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        className="text-blue-700 underline hover:text-blue-900 font-bold"
                        onClick={() => setModalPedidos({visible: true, usuario: u, pedidos: []})}
                      >
                        {u.pedidos_realizados ?? 0}
                      </button>
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleEliminarUsuario(u.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Tabla de administradores registrados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Administradores Registrados</h2>
        <button
          className="mb-4 bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition"
          onClick={() => setModalCrearAdmin(true)}
        >
          Crear Administrador
        </button>
        <Modal
          isOpen={modalCrearAdmin}
          onRequestClose={() => setModalCrearAdmin(false)}
          className="bg-white p-8 rounded shadow-md w-96 mx-auto mt-32 outline-none"
          overlayClassName="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30"
          ariaHideApp={false}
        >
          <h3 className="text-xl font-bold mb-4">Crear nuevo administrador</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setMensajeAdmin('');
              const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'register',
                  nombre: nuevoAdmin.nombre,
                  apellido: nuevoAdmin.apellido,
                  email: nuevoAdmin.email,
                  password: nuevoAdmin.password,
                  rol: 'admin',
                })
              });
              const data = await res.json();
              if (res.ok) {
                setMensajeAdmin('Administrador creado exitosamente.');
                setNuevoAdmin({ nombre: '', apellido: '', email: '', password: '' });
              } else {
                setMensajeAdmin(data.error || 'Error al crear administrador.');
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Nombre"
              className="border px-3 py-2 rounded"
              value={nuevoAdmin.nombre}
              onChange={e => setNuevoAdmin(a => ({ ...a, nombre: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              className="border px-3 py-2 rounded"
              value={nuevoAdmin.apellido}
              onChange={e => setNuevoAdmin(a => ({ ...a, apellido: e.target.value }))}
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="border px-3 py-2 rounded"
              value={nuevoAdmin.email}
              onChange={e => setNuevoAdmin(a => ({ ...a, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="border px-3 py-2 rounded"
              value={nuevoAdmin.password}
              onChange={e => setNuevoAdmin(a => ({ ...a, password: e.target.value }))}
              required
            />
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 transition">Crear</button>
            {mensajeAdmin && <div className="text-center text-sm mt-2">{mensajeAdmin}</div>}
          </form>
          <button className="mt-4 text-blue-700 underline" onClick={() => setModalCrearAdmin(false)}>Cerrar</button>
        </Modal>
        {cargandoUsuarios ? (
          <p>Cargando administradores...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Nombre</th>
                  <th className="p-2 border">Correo</th>
                  <th className="p-2 border">Último acceso</th>
                  <th className="p-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.filter(u => u.rol === 'admin').map((u) => (
                  <tr key={u.id}>
                    <td className="p-2 border">{u.nombre} {u.apellido}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border text-center">{u.last_login ? new Date(u.last_login).toLocaleString() : '-'}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleEliminarUsuario(u.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Sección de Pedidos NO completados */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Pedidos de Clientes</h2>
        <div className="flex gap-2 mb-4">
          <button className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition" onClick={() => descargarPDF(pedidosNoCompletados, 'Pedidos de Clientes')}>Descargar PDF</button>
          <button className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 transition" onClick={() => {
            setFormPedidoNuevo({
              nombre: '',
              apellido: '',
              telefono: '',
              direccion: '',
              productos: []
            });
            setModalCrearPedido(true);
          }}>Crear Pedido Personalizado</button>
        </div>
        {cargandoPedidos ? (
          <div>Cargando pedidos...</div>
        ) : pedidosNoCompletados.length === 0 ? (
          <div>No hay pedidos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border table-fixed text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1 border w-12">ID</th>
                  <th className="px-1 py-1 border w-36">ID Externo</th>
                  <th className="px-1 py-1 border w-32">Cliente</th>
                  <th className="px-1 py-1 border w-24">Teléfono</th>
                  <th className="px-1 py-1 border w-48">Dirección</th>
                  <th className="px-1 py-1 border w-56">Productos</th>
                  <th className="px-1 py-1 border w-20">Total</th>
                  <th className="px-1 py-1 border w-36">Fecha</th>
                  <th className="px-1 py-1 border w-28">Estado</th>
                  <th className="px-1 py-1 border w-24">EDITAR</th>
                </tr>
              </thead>
              <tbody>
                {pedidosNoCompletados.map(pedido => (
                  <tr key={pedido.id}>
                    <td className="border px-1 py-1 align-top text-center">{pedido.id}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words text-center">{pedido.external_id || '-'}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words">{pedido.usuario_nombre} {pedido.usuario_apellido}</td>
                    <td className="border px-1 py-1 align-top text-center">{pedido.telefono_recibe || '-'}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words">{pedido.direccion}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words">
                      <ul className="text-xs space-y-0.5">
                        {pedido.productos.map((prod, idx) => (
                          <li key={idx}>{prod.nombre} x{prod.cantidad} (${prod.precio})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border px-1 py-1 align-top text-center">${pedido.total}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words text-center">{new Date(pedido.created_at).toLocaleDateString('es-CL')}<br/>{new Date(pedido.created_at).toLocaleTimeString('es-CL')}</td>
                    <td className="border px-1 py-1 align-top text-center">
                      <select
                        value={pedido.estado === 'pendiente_whatsapp' ? 'pendiente' : pedido.estado}
                        onChange={async (e) => {
                          const nuevoEstado = e.target.value;
                          const token = localStorage.getItem('token');
                          await fetch(`/api/pedidos`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                            body: JSON.stringify({ pedido_id: pedido.id, estado: nuevoEstado })
                          });
                          cargarPedidos();
                        }}
                        className="border rounded px-1 py-0.5 text-xs w-full"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="proceso">En Proceso</option>
                        <option value="despachado">Despachado</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="border px-1 py-1 align-top text-center">
                      <button
                                                 onClick={() => {
                           setPedidoSeleccionado(pedido);
                           const productosMapeados = pedido.productos.map((prod: { producto_id?: number; id?: number; nombre: string; cantidad: number; precio: number }) => ({
                             id: prod.producto_id || prod.id || 0,
                             nombre: prod.nombre,
                             cantidad: prod.cantidad,
                             precio: prod.precio
                           }));
                           console.log('Pedido seleccionado:', pedido);
                           console.log('external_id del pedido:', pedido.external_id);
                           setFormPedido({
                             nombre: pedido.usuario_nombre,
                             apellido: pedido.usuario_apellido,
                             telefono: pedido.telefono_recibe || '',
                             direccion: pedido.direccion,
                             external_id: pedido.external_id || '',
                             productos: productosMapeados
                           });
                           setModalEditarPedido(true);
                         }}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                      >
                        Editar Pedido
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Sección de Pedidos Completados */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Pedidos Completados</h2>
        <div className="flex gap-2 mb-4">
          <button className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 transition" onClick={() => descargarPDF(pedidosCompletados, 'Pedidos Completados')}>Descargar PDF</button>
          <button
            className="bg-red-700 text-white px-4 py-2 rounded font-semibold hover:bg-red-800 transition"
            onClick={async () => {
              if (!window.confirm('¿Estás seguro de que deseas eliminar el historial? Se descargará una copia en PDF antes de borrar los datos.')) return;
              descargarPDF(pedidosCompletados, 'Pedidos Completados');
              // Llamar API para borrar pedidos completados
              const token = localStorage.getItem('token');
              await fetch('/api/pedidos?estado=completado', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              });
              cargarPedidos();
            }}
          >
            Limpiar historial
          </button>
        </div>
        {cargandoPedidos ? (
          <div>Cargando pedidos...</div>
        ) : pedidosCompletados.length === 0 ? (
          <div>No hay pedidos completados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border table-fixed text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1 border w-12">ID</th>
                  <th className="px-1 py-1 border w-36">ID Externo</th>
                  <th className="px-1 py-1 border w-32">Cliente</th>
                  <th className="px-1 py-1 border w-24">Teléfono</th>
                  <th className="px-1 py-1 border w-48">Dirección</th>
                  <th className="px-1 py-1 border w-56">Productos</th>
                  <th className="px-1 py-1 border w-20">Total</th>
                  <th className="px-1 py-1 border w-36">Fecha</th>
                  <th className="px-1 py-1 border w-28">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosCompletados.map(pedido => (
                  <tr key={pedido.id}>
                    <td className="border px-1 py-1 align-top text-center">{pedido.id}</td>
                    <td className="border px-1 py-1 align-top text-center">{pedido.external_id || '-'}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words">{pedido.usuario_nombre} {pedido.usuario_apellido}</td>
                    <td className="border px-1 py-1 align-top text-center">{pedido.telefono_recibe || '-'}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words">{pedido.direccion}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words">
                      <ul className="text-xs space-y-0.5">
                        {pedido.productos.map((prod, idx) => (
                          <li key={idx}>{prod.nombre} x{prod.cantidad} (${prod.precio})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border px-1 py-1 align-top text-center">${pedido.total}</td>
                    <td className="border px-1 py-1 align-top whitespace-normal break-words text-center">{new Date(pedido.created_at).toLocaleDateString('es-CL')}<br/>{new Date(pedido.created_at).toLocaleTimeString('es-CL')}</td>
                    <td className="border px-1 py-1 align-top text-center">Completado</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Sección de Pedidos Cancelados */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Pedidos Cancelados</h2>
        <div className="flex gap-2 mb-4">
          <button className="bg-red-700 text-white px-4 py-2 rounded font-semibold hover:bg-red-800 transition" onClick={() => descargarPDF(pedidosCancelados, 'Pedidos Cancelados')}>Descargar PDF</button>
          <button
            className="bg-red-700 text-white px-4 py-2 rounded font-semibold hover:bg-red-800 transition"
            onClick={async () => {
              if (!window.confirm('¿Estás seguro de que deseas eliminar el historial? Se descargará una copia en PDF antes de borrar los datos.')) return;
              descargarPDF(pedidosCancelados, 'Pedidos Cancelados');
              // Llamar API para borrar pedidos cancelados
              const token = localStorage.getItem('token');
              await fetch('/api/pedidos?estado=cancelado', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              });
              cargarPedidos();
            }}
          >
            Limpiar historial
          </button>
        </div>
        {cargandoPedidos ? (
          <div>Cargando pedidos...</div>
        ) : pedidosCancelados.length === 0 ? (
          <div>No hay pedidos cancelados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border table-fixed text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-1 py-1 border w-12">ID</th>
                  <th className="px-1 py-1 border w-36">ID Externo</th>
                  <th className="px-1 py-1 border w-32">Cliente</th>
                  <th className="px-1 py-1 border w-24">Teléfono</th>
                  <th className="px-1 py-1 border w-48">Dirección</th>
                  <th className="px-1 py-1 border w-56">Productos</th>
                  <th className="px-1 py-1 border w-20">Total</th>
                  <th className="px-1 py-1 border w-36">Fecha</th>
                  <th className="px-1 py-1 border w-28">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosCancelados.map(pedido => (
                  <tr key={pedido.id}>
                    <td className="border px-1 py-1 align-top text-center">{pedido.id}</td>
                    <td className="border px-1 py-1 align-top text-center">{pedido.external_id || '-'}</td>
                    <td className="border px-1 py-1 align-top">{pedido.usuario_nombre} {pedido.usuario_apellido}</td>
                    <td className="border px-1 py-1 align-top text-center">{pedido.telefono_recibe || '-'}</td>
                    <td className="border px-1 py-1 align-top">{pedido.direccion}</td>
                    <td className="border px-1 py-1 align-top">
                      <ul className="text-xs space-y-0.5">
                        {pedido.productos.map((prod, idx) => (
                          <li key={idx}>{prod.nombre} x{prod.cantidad} (${prod.precio})</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border px-1 py-1 align-top text-center">${pedido.total}</td>
                    <td className="border px-1 py-1 align-top text-center">{new Date(pedido.created_at).toLocaleDateString('es-CL')}<br/>{new Date(pedido.created_at).toLocaleTimeString('es-CL')}</td>
                    <td className="border px-1 py-1 align-top text-center">Cancelado</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal para mostrar pedidos del usuario seleccionado */}
      {modalPedidos.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={() => setModalPedidos({visible: false, usuario: undefined, pedidos: []})}>✕</button>
            <h3 className="text-xl font-bold mb-4">Pedidos de {modalPedidos.usuario?.nombre} {modalPedidos.usuario?.apellido}</h3>
            {modalPedidos.pedidos.length === 0 ? (
              <p className="text-gray-600">Este usuario no ha realizado pedidos.</p>
            ) : (
              <table className="min-w-full border text-xs mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 border">ID</th>
                    <th className="p-1 border">Fecha</th>
                    <th className="p-1 border">Total</th>
                    <th className="p-1 border">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {modalPedidos.pedidos.map((p, idx) => (
                    <React.Fragment key={p.id || idx}>
                      <tr>
                        <td className="p-1 border align-top">{p.id}</td>
                        <td className="p-1 border align-top">{new Date(p.created_at).toLocaleString()}</td>
                        <td className="p-1 border align-top">${p.total}</td>
                        <td className="p-1 border align-top">{p.estado}</td>
                      </tr>
                      {Array.isArray(p.productos) && p.productos.length > 0 ? (
                        <tr>
                          <td colSpan={4} className="p-1 border bg-gray-50">
                            <div className="text-xs font-semibold mb-1">Productos:</div>
                            <ul className="pl-4 list-disc">
                              {p.productos.map((prod: { nombre: string; cantidad: number; precio: number }, i: number) => (
                                <li key={i} className="mb-1">
                                  {prod.nombre} x{prod.cantidad} <span className="text-gray-500">(${prod.precio} c/u)</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      <Modal
        isOpen={modalFactura.open}
        onRequestClose={() => setModalFactura({open: false, data: null})}
        className="bg-white p-8 rounded shadow-md w-full max-w-lg mx-auto mt-32 outline-none"
        overlayClassName="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30"
        ariaHideApp={false}
      >
        <h3 className="text-xl font-bold mb-4">Datos de Facturación</h3>
        {modalFactura.data ? (
          <div className="space-y-2">
            <div><b>Razón social:</b> {modalFactura.data.razon_social}</div>
            <div><b>RUT:</b> {modalFactura.data.rut}</div>
            <div><b>Giro:</b> {modalFactura.data.giro}</div>
            <div><b>Teléfono:</b> {modalFactura.data.telefono}</div>
            <div><b>Región:</b> {modalFactura.data.region}</div>
            <div><b>Comuna:</b> {modalFactura.data.comuna}</div>
            <div><b>Calle:</b> {modalFactura.data.calle}</div>
            <div><b>Número:</b> {modalFactura.data.numero}</div>
            <div><b>Depto/Oficina:</b> {modalFactura.data.depto_oficina}</div>
          </div>
        ) : <div>No hay datos de facturación.</div>}
        <button className="mt-6 text-blue-700 underline" onClick={() => setModalFactura({open: false, data: null})}>Cerrar</button>
      </Modal>

      {/* Modal para Crear Pedido Personalizado */}
      <Modal
        isOpen={modalCrearPedido}
        onRequestClose={() => setModalCrearPedido(false)}
        className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={() => setModalCrearPedido(false)}>✕</button>
          <h3 className="text-xl font-bold mb-4">Crear Pedido Personalizado</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Cliente</label>
                <input
                  type="text"
                  value={formPedidoNuevo.nombre}
                  onChange={(e) => setFormPedidoNuevo({...formPedidoNuevo, nombre: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apellido Cliente</label>
                <input
                  type="text"
                  value={formPedidoNuevo.apellido}
                  onChange={(e) => setFormPedidoNuevo({...formPedidoNuevo, apellido: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Apellido del cliente"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                value={formPedidoNuevo.telefono}
                onChange={(e) => setFormPedidoNuevo({...formPedidoNuevo, telefono: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Teléfono del cliente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <textarea
                value={formPedidoNuevo.direccion}
                onChange={(e) => setFormPedidoNuevo({...formPedidoNuevo, direccion: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Dirección completa del cliente"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Productos Disponibles</label>
              <div className="border rounded p-3 max-h-60 overflow-y-auto">
                {productos.filter(p => p.stock > 0).map(producto => (
                  <div key={producto.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <span className="font-medium">{producto.nombre}</span>
                      <span className="text-gray-600 ml-2">- ${producto.precio} (Stock: {producto.stock})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const existing = formPedidoNuevo.productos.find(p => p.id === producto.id);
                          if (existing) {
                            setFormPedidoNuevo({
                              ...formPedidoNuevo,
                              productos: formPedidoNuevo.productos.map(p => 
                                p.id === producto.id 
                                  ? {...p, cantidad: Math.min(p.cantidad + 1, producto.stock), precio: calcularPrecioConDescuento(producto, Math.min(p.cantidad + 1, producto.stock))}
                                  : p
                              )
                            });
                          } else {
                            setFormPedidoNuevo({
                              ...formPedidoNuevo,
                              productos: [...formPedidoNuevo.productos, {
                                id: producto.id,
                                nombre: producto.nombre,
                                cantidad: 1,
                                precio: calcularPrecioConDescuento(producto, 1)
                              }]
                            });
                          }
                        }}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        +
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={producto.stock}
                        value={formPedidoNuevo.productos.find(p => p.id === producto.id)?.cantidad || 0}
                        onChange={(e) => {
                          const cantidad = Math.max(0, Math.min(producto.stock, Number(e.target.value) || 0));
                          const existing = formPedidoNuevo.productos.find(p => p.id === producto.id);
                          if (cantidad > 0) {
                            if (existing) {
                              setFormPedidoNuevo(prev => ({
                                ...prev,
                                productos: prev.productos.map(p => 
                                  p.id === producto.id 
                                    ? { ...p, cantidad, precio: calcularPrecioConDescuento(producto, cantidad) }
                                    : p
                                )
                              }));
                            } else {
                              setFormPedidoNuevo(prev => ({
                                ...prev,
                                productos: [...prev.productos, {
                                  id: producto.id,
                                  nombre: producto.nombre,
                                  cantidad,
                                  precio: calcularPrecioConDescuento(producto, cantidad)
                                }]
                              }));
                            }
                          } else {
                            setFormPedidoNuevo(prev => ({
                              ...prev,
                              productos: prev.productos.filter(p => p.id !== producto.id)
                            }));
                          }
                        }}
                        className="w-16 px-2 py-1 text-center border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          const existing = formPedidoNuevo.productos.find(p => p.id === producto.id);
                          if (existing && existing.cantidad > 1) {
                            setFormPedidoNuevo({
                              ...formPedidoNuevo,
                              productos: formPedidoNuevo.productos.map(p => 
                                p.id === producto.id 
                                  ? {...p, cantidad: p.cantidad - 1, precio: calcularPrecioConDescuento(producto, p.cantidad - 1)}
                                  : p
                              )
                            });
                          } else if (existing) {
                            setFormPedidoNuevo({
                              ...formPedidoNuevo,
                              productos: formPedidoNuevo.productos.filter(p => p.id !== producto.id)
                            });
                          }
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        -
                      </button>
                    </div>
                  </div>
                   ))}
              </div>
            </div>
            
            {formPedidoNuevo.productos.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Productos Seleccionados</label>
                <div className="border rounded p-3">
                  {formPedidoNuevo.productos.map(prod => (
                    <div key={prod.id} className="flex justify-between py-1">
                      <span>{prod.nombre} x{prod.cantidad}</span>
                      <span>${(prod.precio * prod.cantidad).toFixed(2)}</span>
                    </div>
                   ))}
                  <div className="border-t pt-2 mt-2 font-bold">
                    Total: ${formPedidoNuevo.productos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={async () => {
                if (!formPedidoNuevo.nombre || !formPedidoNuevo.apellido || !formPedidoNuevo.telefono || !formPedidoNuevo.direccion || formPedidoNuevo.productos.length === 0) {
                  alert('Por favor completa todos los campos y selecciona al menos un producto');
                  return;
                }
                
                const token = localStorage.getItem('token');
                const response = await fetch('/api/pedidos', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    nombre: formPedidoNuevo.nombre,
                    apellido: formPedidoNuevo.apellido,
                    telefono: formPedidoNuevo.telefono,
                    direccion: formPedidoNuevo.direccion,
                    productos: formPedidoNuevo.productos,
                    estado: 'pendiente'
                  })
                });
                
                if (response.ok) {
                  setModalCrearPedido(false);
                  setFormPedidoNuevo({ nombre: '', apellido: '', telefono: '', direccion: '', productos: [] });
                  cargarPedidos();
                  alert('Pedido creado exitosamente');
                } else {
                  alert('Error al crear el pedido');
                }
              }}
              className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800"
            >
              Crear Pedido
            </button>
            <button
              onClick={() => setModalCrearPedido(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para Editar Pedido */}
      <Modal
        isOpen={modalEditarPedido}
        onRequestClose={() => setModalEditarPedido(false)}
        className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={() => setModalEditarPedido(false)}>✕</button>
          <h3 className="text-xl font-bold mb-4">Editar Pedido #{pedidoSeleccionado?.id}</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Cliente</label>
                <input
                  type="text"
                  value={formPedido.nombre}
                  onChange={(e) => setFormPedido({...formPedido, nombre: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apellido Cliente</label>
                <input
                  type="text"
                  value={formPedido.apellido}
                  onChange={(e) => setFormPedido({...formPedido, apellido: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                value={formPedido.telefono}
                onChange={(e) => setFormPedido({...formPedido, telefono: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <textarea
                value={formPedido.direccion}
                onChange={(e) => setFormPedido({...formPedido, direccion: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ID Externo (WhatsApp)</label>
              <input
                type="text"
                value={formPedido.external_id}
                onChange={(e) => setFormPedido({...formPedido, external_id: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="ID generado por WhatsApp (opcional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Productos Disponibles</label>
              <div className="border rounded p-3 max-h-60 overflow-y-auto">
                                 {productos.filter(p => {
                   const cantidadEnPedido = pedidoSeleccionado?.productos?.find((pp: { producto_id?: number; id?: number; cantidad: number }) => pp.producto_id === p.id || pp.id === p.id)?.cantidad || 0;
                   const stockDisponible = p.stock + cantidadEnPedido;
                   return stockDisponible > 0;
                 }).map(producto => {
                  const cantidadEnPedido = pedidoSeleccionado?.productos?.find((pp: { producto_id?: number; id?: number; cantidad: number }) => pp.producto_id === producto.id || pp.id === producto.id)?.cantidad || 0;
                  const stockDisponible = producto.stock + cantidadEnPedido;
                  return (
                    <div key={producto.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <span className="font-medium">{producto.nombre}</span>
                        <span className="text-gray-600 ml-2">- ${producto.precio} (Stock: {stockDisponible})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const existing = formPedido.productos.find(p => p.id === producto.id);
                            if (existing) {
                              const nuevaCantidad = Math.min(existing.cantidad + 1, stockDisponible);
                              setFormPedido({
                                ...formPedido,
                                productos: formPedido.productos.map(p => 
                                  p.id === producto.id 
                                    ? {...p, cantidad: nuevaCantidad, precio: calcularPrecioConDescuento(producto, nuevaCantidad)}
                                    : p
                                )
                              });
                            } else {
                              setFormPedido({
                                ...formPedido,
                                productos: [...formPedido.productos, {
                                  id: producto.id,
                                  nombre: producto.nombre,
                                  cantidad: 1,
                                  precio: calcularPrecioConDescuento(producto, 1)
                                }]
                              });
                            }
                          }}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 font-bold"
                        >
                          +
                        </button>
                                                 <input
                          type="number"
                          min="0"
                          max={stockDisponible}
                          value={formPedido.productos.find(p => p.id === producto.id)?.cantidad || 0}
                          onChange={(e) => {
                            const cantidad = Math.max(0, Math.min(stockDisponible, Number(e.target.value) || 0));
                            const existing = formPedido.productos.find(p => p.id === producto.id);
                            if (cantidad > 0) {
                              if (existing) {
                                setFormPedido(prev => ({
                                  ...prev,
                                  productos: prev.productos.map(p => 
                                    p.id === producto.id 
                                      ? { ...p, cantidad, precio: calcularPrecioConDescuento(producto, cantidad) }
                                      : p
                                  )
                                }));
                              } else {
                                setFormPedido(prev => ({
                                  ...prev,
                                  productos: [...prev.productos, {
                                    id: producto.id,
                                    nombre: producto.nombre,
                                    cantidad,
                                    precio: calcularPrecioConDescuento(producto, cantidad)
                                  }]
                                }));
                              }
                            } else {
                              setFormPedido(prev => ({
                                ...prev,
                                productos: prev.productos.filter(p => p.id !== producto.id)
                              }));
                            }
                          }}
                          className="w-16 px-2 py-1 text-center border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        />
                        <button
                          onClick={() => {
                            const existing = formPedido.productos.find(p => p.id === producto.id);
                            if (existing && existing.cantidad > 1) {
                              const nuevaCantidad = existing.cantidad - 1;
                              setFormPedido({
                                ...formPedido,
                                productos: formPedido.productos.map(p => 
                                  p.id === producto.id 
                                    ? {...p, cantidad: nuevaCantidad, precio: calcularPrecioConDescuento(producto, nuevaCantidad)}
                                    : p
                                )
                              });
                            } else if (existing) {
                              setFormPedido({
                                ...formPedido,
                                productos: formPedido.productos.filter(p => p.id !== producto.id)
                              });
                            }
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 font-bold"
                        >
                          -
                        </button>
                      </div>
    </div>
  );
                })}
              </div>
            </div>
            
            {formPedido.productos.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Productos Seleccionados</label>
                <div className="border rounded p-3">
                  {formPedido.productos.map((prod, index) => (
                    <div key={`${prod.id}-${index}`} className="flex justify-between py-1">
                      <span>{prod.nombre} x{prod.cantidad}</span>
                      <span>${(prod.precio * prod.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-bold">
                    Total: ${formPedido.productos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={async () => {
                if (!formPedido.nombre || !formPedido.apellido || !formPedido.telefono || !formPedido.direccion || formPedido.productos.length === 0) {
                  alert('Por favor completa todos los campos y selecciona al menos un producto');
                  return;
                }
                
                const token = localStorage.getItem('token');
                const requestData = {
                  pedido_id: pedidoSeleccionado?.id,
                  nombre: formPedido.nombre,
                  apellido: formPedido.apellido,
                  telefono: formPedido.telefono,
                  direccion: formPedido.direccion,
                  external_id: formPedido.external_id,
                  productos: formPedido.productos
                };
                console.log('Enviando datos de actualización:', requestData);
                const response = await fetch('/api/pedidos', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify(requestData)
                });
                
                if (response.ok) {
                  setModalEditarPedido(false);
                  setPedidoSeleccionado(null);
                  cargarPedidos();
                  alert('Pedido actualizado exitosamente');
                } else {
                  const errorData = await response.json();
                  console.error('Error al actualizar pedido:', errorData);
                  alert(`Error al actualizar el pedido: ${errorData.error || 'Error desconocido'}`);
                }
              }}
              className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800"
            >
              Actualizar Pedido
            </button>
            <button
              onClick={() => setModalEditarPedido(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
