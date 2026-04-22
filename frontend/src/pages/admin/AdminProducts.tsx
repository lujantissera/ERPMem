import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi } from '../../lib/api';
import type { Product, Category } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';

interface ProductForm {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  productionCost: string;
  stock: string;
  minStock: string;
  material: string;
  imageUrl: string;
  minWidth: string; maxWidth: string;
  minHeight: string; maxHeight: string;
  minDepth: string; maxDepth: string;
}

const emptyForm: ProductForm = {
  categoryId: '', name: '', description: '', price: '', productionCost: '',
  stock: '0', minStock: '5', material: '', imageUrl: '',
  minWidth: '', maxWidth: '', minHeight: '', maxHeight: '', minDepth: '', maxDepth: '',
};

function toPayload(f: ProductForm) {
  return {
    categoryId: parseInt(f.categoryId),
    name: f.name,
    description: f.description,
    price: parseFloat(f.price),
    productionCost: f.productionCost ? parseFloat(f.productionCost) : null,
    stock: parseInt(f.stock) || 0,
    minStock: parseInt(f.minStock) || 5,
    material: f.material || null,
    imageUrl: f.imageUrl || null,
    minWidth: f.minWidth ? parseFloat(f.minWidth) : null,
    maxWidth: f.maxWidth ? parseFloat(f.maxWidth) : null,
    minHeight: f.minHeight ? parseFloat(f.minHeight) : null,
    maxHeight: f.maxHeight ? parseFloat(f.maxHeight) : null,
    minDepth: f.minDepth ? parseFloat(f.minDepth) : null,
    maxDepth: f.maxDepth ? parseFloat(f.maxDepth) : null,
  };
}

function fromProduct(p: Product): ProductForm {
  return {
    categoryId: String(p.categoryId),
    name: p.name, description: p.description,
    price: String(p.price), productionCost: p.productionCost ? String(p.productionCost) : '',
    stock: String(p.stock), minStock: String(p.minStock),
    material: p.material || '', imageUrl: p.imageUrl || '',
    minWidth: p.minWidth ? String(p.minWidth) : '', maxWidth: p.maxWidth ? String(p.maxWidth) : '',
    minHeight: p.minHeight ? String(p.minHeight) : '', maxHeight: p.maxHeight ? String(p.maxHeight) : '',
    minDepth: p.minDepth ? String(p.minDepth) : '', maxDepth: p.maxDepth ? String(p.maxDepth) : '',
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productsApi.listAdmin({ search: search || undefined, page, limit: 20 });
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoriesApi.list().then((r) => setCategories(r.data)); }, []);

  const set = (field: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (p: Product) => { setEditTarget(p); setForm(fromProduct(p)); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async () => {
    if (!form.categoryId || !form.name || !form.price) { toast.error('Completá los campos obligatorios'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        const { data } = await productsApi.create(toPayload(form));
        setProducts((prev) => [data, ...prev]);
        toast.success('Producto creado');
      } else if (editTarget) {
        const { data } = await productsApi.update(editTarget.id, toPayload(form));
        setProducts((prev) => prev.map((p) => (p.id === editTarget.id ? data : p)));
        toast.success('Producto actualizado');
      }
      closeModal();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desactivar este producto?')) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Producto desactivado');
    } catch {
      toast.error('Error al desactivar');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-dark">Productos</h1>
          <p className="text-warm-muted text-sm mt-1">{products.length} productos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
        <input
          type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3"
        />
      </div>

      {loading ? <PageSpinner /> : (
        <>
          <div className="bg-white rounded-xl border border-warm-border overflow-hidden">
            {products.length === 0 ? (
              <div className="p-10 text-center text-warm-muted flex flex-col items-center gap-3">
                <Package className="w-10 h-10 opacity-20" />
                <p>No se encontraron productos</p>
              </div>
            ) : (
              <div className="divide-y divide-warm-border">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-14 h-14 rounded-lg bg-warm-bg-2 border border-warm-border flex items-center justify-center shrink-0 overflow-hidden">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : <Package className="w-6 h-6 text-warm-border" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-dark-3 truncate">{p.name}</p>
                        {!p.active && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-xs rounded">Inactivo</span>}
                        {p.stock <= p.minStock && p.active && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded">
                            <AlertTriangle className="w-3 h-3" /> Stock bajo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-warm-muted">{p.category.name} {p.material && `· ${p.material}`}</p>
                      <p className="text-xs text-warm-muted">Stock: {p.stock} (mín: {p.minStock})</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-heading text-xl font-bold text-accent">
                        ${Number(p.price).toLocaleString('es-AR')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 text-warm-muted hover:text-accent rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-warm-muted hover:text-danger rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-accent text-white' : 'bg-white border border-warm-border text-dark-3 hover:border-accent'}`}
                >{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-warm-border">
              <h2 className="font-heading text-2xl font-bold text-dark">
                {modal === 'create' ? 'Nuevo producto' : 'Editar producto'}
              </h2>
              <button onClick={closeModal} className="text-warm-muted hover:text-dark transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Nombre *</label>
                  <input type="text" value={form.name} onChange={set('name')} className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Categoría *</label>
                  <select value={form.categoryId} onChange={set('categoryId')} className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3 bg-white">
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Material</label>
                  <input type="text" value={form.material} onChange={set('material')} className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3" placeholder="Ej: Madera, Tela" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Precio *</label>
                  <input type="number" value={form.price} onChange={set('price')} min="0" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Costo producción</label>
                  <input type="number" value={form.productionCost} onChange={set('productionCost')} min="0" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Stock</label>
                  <input type="number" value={form.stock} onChange={set('stock')} min="0" className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Stock mínimo</label>
                  <input type="number" value={form.minStock} onChange={set('minStock')} min="0" className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">URL imagen</label>
                  <input type="text" value={form.imageUrl} onChange={set('imageUrl')} className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3" placeholder="https://..." />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Descripción *</label>
                  <textarea value={form.description} onChange={set('description')} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3 resize-none" />
                </div>
              </div>

              {/* Custom dims */}
              <div className="border-t border-warm-border pt-4">
                <p className="text-xs font-medium text-warm-muted uppercase tracking-wider mb-3">Dimensiones personalizables (cm) — opcional</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['Width', 'Height', 'Depth'] as const).map((dim) => {
                    const label = { Width: 'Ancho', Height: 'Alto', Depth: 'Prof.' }[dim];
                    const minKey = `min${dim}` as keyof ProductForm;
                    const maxKey = `max${dim}` as keyof ProductForm;
                    return (
                      <div key={dim} className="flex flex-col gap-1.5">
                        <label className="text-xs text-warm-muted">{label}</label>
                        <input type="number" value={form[minKey]} onChange={set(minKey)} placeholder="Mín" min="0" className="px-2.5 py-2 rounded-lg border border-warm-border focus:border-accent outline-none text-xs text-dark-3" />
                        <input type="number" value={form[maxKey]} onChange={set(maxKey)} placeholder="Máx" min="0" className="px-2.5 py-2 rounded-lg border border-warm-border focus:border-accent outline-none text-xs text-dark-3" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-warm-border">
              <button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-warm-muted hover:text-dark rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors">
                {saving ? 'Guardando...' : modal === 'create' ? 'Crear' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
