import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const payload = { ...form, phone: form.phone || undefined, address: form.address || undefined };
      const { data } = await authApi.register(payload);
      login(data.user, data.token);
      toast.success('¡Cuenta creada! Bienvenido/a');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl font-bold text-dark">MEM</h1>
          <p className="text-warm-muted text-sm mt-1">Materiales en Movimiento</p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-border p-8 shadow-sm">
          <h2 className="font-heading text-3xl font-bold text-dark mb-6">Crear cuenta</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-3 mb-1.5">Nombre completo *</label>
              <input
                type="text" required value={form.name} onChange={set('name')}
                className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                placeholder="Juan García"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-3 mb-1.5">Email *</label>
              <input
                type="email" required value={form.email} onChange={set('email')}
                className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-3 mb-1.5">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                  placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted hover:text-dark-3">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-3 mb-1.5">Teléfono</label>
              <input
                type="tel" value={form.phone} onChange={set('phone')}
                className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-3 mb-1.5">Dirección</label>
              <input
                type="text" value={form.address} onChange={set('address')}
                className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                placeholder="Calle 123, Ciudad"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-warm-muted mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">Ingresá</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
