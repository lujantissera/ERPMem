import { useEffect, useState } from 'react';
import { Search, Trash2, User, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../../lib/api';
import type { User as UserType } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../stores/authStore';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone: string;
  address: string;
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'CUSTOMER', phone: '', address: '' };

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    usersApi.list().then((r) => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) { toast.error('No podés eliminar tu propia cuenta'); return; }
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Usuario eliminado');
    } catch {
      toast.error('Error al eliminar usuario');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersApi.create({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      setUsers((prev) => [data, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
      toast.success('Cliente creado');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Error al crear cliente');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof UserForm, type = 'text', required = false) => (
    <div>
      <label className="block text-xs font-medium text-dark-3 mb-1">{label}{required && <span className="text-danger ml-0.5">*</span>}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required={required}
        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3"
      />
    </div>
  );

  const filtered = users.filter(
    (u) => !search || `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-dark">Clientes</h1>
          <p className="text-warm-muted text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3"
          />
        </div>
      </div>

      {loading ? <PageSpinner /> : (
        <div className="bg-white rounded-xl border border-warm-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-warm-muted">No se encontraron usuarios</div>
          ) : (
            <div className="divide-y divide-warm-border">
              {filtered.map((user) => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-dark-3">{user.name}</p>
                      {user.role === 'ADMIN' && (
                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">Admin</span>
                      )}
                    </div>
                    <p className="text-sm text-warm-muted">{user.email}</p>
                    {user.phone && <p className="text-xs text-warm-muted">{user.phone}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs text-warm-muted hidden sm:block">
                      {new Date(user.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {user.id !== currentUser?.id && (
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-warm-muted hover:text-danger rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border">
              <h2 className="font-heading text-2xl font-bold text-dark">Nuevo cliente</h2>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="p-2 text-warm-muted hover:text-dark rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {field('Nombre completo', 'name', 'text', true)}
              {field('Email', 'email', 'email', true)}
              {field('Contraseña', 'password', 'password', true)}
              {field('Teléfono', 'phone')}
              {field('Dirección', 'address')}

              <div>
                <label className="block text-xs font-medium text-dark-3 mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'CUSTOMER' | 'ADMIN' }))}
                  className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                >
                  <option value="CUSTOMER">Cliente</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(emptyForm); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-warm-border text-dark-3 text-sm font-medium hover:bg-warm-border/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creando...' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
