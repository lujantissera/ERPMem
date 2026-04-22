import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../lib/api';
import type { Category } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const { data } = await categoriesApi.create({ name: form.name, description: form.description || undefined });
      setCategories((prev) => [...prev, data]);
      setForm({ name: '', description: '' });
      setCreating(false);
      toast.success('Categoría creada');
    } catch {
      toast.error('Error al crear categoría');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const { data } = await categoriesApi.update(id, { name: form.name, description: form.description || undefined });
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
      setEditingId(null);
      toast.success('Categoría actualizada');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await categoriesApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Categoría eliminada');
    } catch {
      toast.error('Error al eliminar (puede tener productos asociados)');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-dark">Categorías</h1>
          <p className="text-warm-muted text-sm mt-1">{categories.length} categorías</p>
        </div>
        <button
          onClick={() => { setCreating(true); setForm({ name: '', description: '' }); }}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      {creating && (
        <div className="bg-white rounded-xl border border-accent p-5 mb-4">
          <h3 className="font-heading text-xl font-bold text-dark mb-4">Nueva categoría</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre *" autoFocus
              className="px-4 py-2.5 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-dark-3 text-sm"
            />
            <input
              type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción (opcional)"
              className="px-4 py-2.5 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-dark-3 text-sm"
            />
            <div className="flex gap-2">
              <button onClick={handleCreate} className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Check className="w-4 h-4" /> Crear
              </button>
              <button onClick={() => setCreating(false)} className="flex items-center gap-1.5 text-warm-muted hover:text-dark text-sm px-4 py-2 rounded-lg transition-colors">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? <PageSpinner /> : (
        <div className="bg-white rounded-xl border border-warm-border overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-10 text-center text-warm-muted">Sin categorías</div>
          ) : (
            <div className="divide-y divide-warm-border">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 px-5 py-4">
                  {editingId === cat.id ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus
                        className="px-3 py-2 rounded-lg border border-warm-border focus:border-accent outline-none text-dark-3 text-sm"
                      />
                      <input
                        type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Descripción" className="px-3 py-2 rounded-lg border border-warm-border focus:border-accent outline-none text-dark-3 text-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(cat.id)} className="flex items-center gap-1 bg-accent text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                          <Check className="w-3 h-3" /> Guardar
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-warm-muted text-xs px-3 py-1.5 rounded-lg hover:text-dark">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark-3">{cat.name}</p>
                        {cat.description && <p className="text-xs text-warm-muted mt-0.5">{cat.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(cat)} className="p-2 text-warm-muted hover:text-accent rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-warm-muted hover:text-danger rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
