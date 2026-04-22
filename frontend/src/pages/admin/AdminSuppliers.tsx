import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { suppliersApi } from '../../lib/api';
import type { Supplier } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';

interface SupplierForm { name: string; email: string; phone: string; address: string; }
const emptyForm: SupplierForm = { name: '', email: '', phone: '', address: '' };

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    suppliersApi.list().then((r) => setSuppliers(r.data)).finally(() => setLoading(false));
  }, []);

  const set = (field: keyof SupplierForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (s: Supplier) => {
    setEditTarget(s);
    setForm({ name: s.name, email: s.email, phone: s.phone || '', address: s.address || '' });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Nombre y email son obligatorios'); return; }
    setSaving(true);
    try {
      const payload = { ...form, phone: form.phone || undefined, address: form.address || undefined };
      if (modal === 'create') {
        const { data } = await suppliersApi.create(payload);
        setSuppliers((prev) => [...prev, data]);
        toast.success('Proveedor creado');
      } else if (editTarget) {
        const { data } = await suppliersApi.update(editTarget.id, payload);
        setSuppliers((prev) => prev.map((s) => (s.id === editTarget.id ? data : s)));
        toast.success('Proveedor actualizado');
      }
      closeModal();
    } catch {
      toast.error('Error al guardar proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try {
      await suppliersApi.delete(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success('Proveedor eliminado');
    } catch {
      toast.error('Error al eliminar (puede tener órdenes asociadas)');
    }
  };

  const ModalForm = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-warm-border">
          <h2 className="font-heading text-2xl font-bold text-dark">
            {modal === 'create' ? 'Nuevo proveedor' : 'Editar proveedor'}
          </h2>
          <button onClick={closeModal}><X className="w-5 h-5 text-warm-muted hover:text-dark" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {([
            { field: 'name', label: 'Nombre *', type: 'text', placeholder: 'Empresa S.A.' },
            { field: 'email', label: 'Email *', type: 'email', placeholder: 'contacto@proveedor.com' },
            { field: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+54 11 1234-5678' },
            { field: 'address', label: 'Dirección', type: 'text', placeholder: 'Calle 123, Ciudad' },
          ] as const).map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type} value={form[field]} onChange={set(field)} placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-warm-border">
          <button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-warm-muted hover:text-dark rounded-xl">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors">
            {saving ? 'Guardando...' : modal === 'create' ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-dark">Proveedores</h1>
          <p className="text-warm-muted text-sm mt-1">{suppliers.length} proveedores</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" /> Nuevo proveedor
        </button>
      </div>

      {loading ? <PageSpinner /> : (
        <div className="bg-white rounded-xl border border-warm-border overflow-hidden">
          {suppliers.length === 0 ? (
            <div className="p-10 text-center text-warm-muted flex flex-col items-center gap-3">
              <Truck className="w-10 h-10 opacity-20" />
              <p>Sin proveedores. Agregá uno para empezar.</p>
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {suppliers.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-3">{s.name}</p>
                    <p className="text-sm text-warm-muted">{s.email}</p>
                    {s.phone && <p className="text-xs text-warm-muted">{s.phone}</p>}
                    {s.address && <p className="text-xs text-warm-muted">{s.address}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(s)} className="p-2 text-warm-muted hover:text-accent rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-warm-muted hover:text-danger rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal && <ModalForm />}
    </div>
  );
}
