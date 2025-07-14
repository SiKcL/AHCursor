"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Completa ambos campos.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email: form.email, password: form.password })
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      if (form.email === 'admin@admin.com') {
        router.push('/admin');
        return;
      }
      router.push('/perfil');
    } else {
      setError(data.error || 'Error en el login.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-2 text-[color:var(--primary)] text-center">Iniciar Sesión</h2>
        <div>
          <label className="block text-sm font-semibold">E-mail</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-semibold">Contraseña</label>
          <div className="relative">
            <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2 pr-10" required />
            <button type="button" className="absolute right-2 top-2 text-xs text-gray-500" onClick={() => setShowPass(v => !v)}>
              {showPass ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        <button type="submit" className="w-full bg-[color:var(--primary)] text-white py-3 rounded font-bold mt-4 hover:bg-[color:var(--secondary)] transition" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <div className="text-center text-sm mt-4">
          ¿No tienes cuenta? <a href="/registro" className="underline text-[color:var(--primary)] hover:text-[color:var(--secondary)]">Regístrate aquí</a>
        </div>
      </form>
    </div>
  );
} 