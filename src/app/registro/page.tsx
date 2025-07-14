"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '', apellido: '', rut: '', fecha_nacimiento: '', email: '', telefono: '', password: '', repite: '', factura: false,
    region: '', comuna: '', calle: '', numero: '', depto_oficina: '', nombre_recibe: '', apellido_recibe: '', telefono_recibe: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acepta, setAcepta] = useState(false);

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

  const [facturaForm, setFacturaForm] = useState({
    razon_social: '', rut: '', giro: '', telefono: '', region: '', comuna: '', calle: '', numero: '', depto_oficina: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleFacturaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFacturaForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.nombre) {
      setError('El campo nombre es obligatorio.'); return;
    }
    if (!form.email) {
      setError('El campo email es obligatorio.'); return;
    }
    if (!form.password) {
      setError('El campo contraseña es obligatorio.'); return;
    }
    if (!form.repite) {
      setError('Debes repetir la contraseña.'); return;
    }
    // Si quieres que fecha_nacimiento sea obligatoria, descomenta:
    // if (!form.fecha_nacimiento) { setError('El campo fecha de nacimiento es obligatorio.'); return; }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.'); return;
    }
    if (form.password !== form.repite) {
      setError('Las contraseñas no coinciden.'); return;
    }
    if (!acepta) {
      setError('Debes aceptar los Términos y Condiciones.'); return;
    }
    if (form.factura) {
      if (!facturaForm.razon_social || !facturaForm.rut || !facturaForm.giro || !facturaForm.telefono || !facturaForm.region || !facturaForm.comuna || !facturaForm.calle || !facturaForm.numero) {
        setError('Completa todos los datos de facturación.'); return;
      }
    }
    // Preparar datos de dirección solo si hay datos válidos
    let direccion = undefined;
    if (form.region && form.comuna && form.calle && form.numero) {
      direccion = {
        region: form.region,
        comuna: form.comuna,
        calle: form.calle,
        numero: form.numero,
        depto_oficina: form.depto_oficina,
        nombre_recibe: form.nombre_recibe,
        apellido_recibe: form.apellido_recibe,
        telefono_recibe: form.telefono_recibe
      };
    }
    setLoading(true);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        nombre: form.nombre,
        apellido: form.apellido,
        rut: form.rut,
        fecha_nacimiento: form.fecha_nacimiento,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
        factura: form.factura,
        datos_factura: form.factura ? facturaForm : undefined,
        direccion // solo se envía si es válida
      })
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setSuccess('¡Registro exitoso! Redirigiendo...');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setTimeout(() => router.push('/perfil'), 1500);
    } else {
      setError(data.error || 'Error en el registro.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8 flex flex-col md:flex-row gap-8">
        {/* Formulario principal */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold mb-2 text-[color:var(--primary)]">Titular de la cuenta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-semibold">Apellido</label>
              <input name="apellido" value={form.apellido} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">RUT</label>
              <input name="rut" value={form.rut} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Fecha de Nacimiento (obligatorio)</label>
              <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">E-mail</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-semibold">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="factura" checked={form.factura} onChange={handleChange} />
            <span className="text-sm">Necesito comprar con factura</span>
          </div>
          {form.factura && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-4">
              <h3 className="text-xl font-bold mb-2">Datos para emisión de facturas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold">Razón social</label>
                  <input name="razon_social" value={facturaForm.razon_social} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" maxLength={100} required={form.factura} />
                </div>
                <div>
                  <label className="block text-sm font-semibold">RUT</label>
                  <input name="rut" value={facturaForm.rut} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" required={form.factura} />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Giro del negocio</label>
                  <input name="giro" value={facturaForm.giro} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" maxLength={40} required={form.factura} />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Teléfono</label>
                  <input name="telefono" value={facturaForm.telefono} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" required={form.factura} />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Región</label>
                  <select name="region" value={facturaForm.region} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" required={form.factura}>
                    <option value="">Selecciona una región</option>
                    {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold">Comuna</label>
                  <input name="comuna" value={facturaForm.comuna} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" required={form.factura} />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Calle</label>
                  <input name="calle" value={facturaForm.calle} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" required={form.factura} />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Número</label>
                  <input name="numero" value={facturaForm.numero} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" required={form.factura} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold">N° depto / oficina / otro dato (si aplica)</label>
                  <input name="depto_oficina" value={facturaForm.depto_oficina} onChange={handleFacturaChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
            </div>
          )}
          <h3 className="text-xl font-bold mt-6 mb-2">Contraseña</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" required minLength={8} />
              <span className="text-xs text-gray-500">Mínimo 8 caracteres</span>
            </div>
            <div>
              <label className="block text-sm font-semibold">Repite contraseña</label>
              <input name="repite" type="password" value={form.repite} onChange={handleChange} className="w-full border rounded px-3 py-2" required minLength={8} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} />
            <span className="text-sm">Acepto los <a href="#" className="underline">Términos y Condiciones</a></span>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          <button type="submit" className="w-full bg-[color:var(--primary)] text-white py-3 rounded font-bold mt-4 hover:bg-[color:var(--secondary)] transition" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        {/* Dirección de envío (opcional, solo UI por ahora) */}
        <div className="flex-1 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-2 text-[color:var(--primary)]">Dirección de envío (opcional)</h2>
          <p className="text-xs text-gray-500 mb-4">Ingresa los datos ahora y ahorra tiempo en tu próxima compra</p>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-semibold">Región</label>
              <input name="region" value={form.region} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Comuna</label>
              <input name="comuna" value={form.comuna} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Calle</label>
              <input name="calle" value={form.calle} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Número</label>
              <input name="numero" value={form.numero} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">N° depto / oficina / otro dato (si aplica)</label>
              <input name="depto_oficina" value={form.depto_oficina} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <hr className="my-2" />
            <div>
              <label className="block text-sm font-semibold">Nombre de quien recibe</label>
              <input name="nombre_recibe" value={form.nombre_recibe} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Apellido de quien recibe</label>
              <input name="apellido_recibe" value={form.apellido_recibe} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Teléfono</label>
              <input name="telefono_recibe" value={form.telefono_recibe} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Una vez que estés registrado/a, podrás ingresar más direcciones de envío</p>
        </div>
      </div>
    </div>
  );
} 