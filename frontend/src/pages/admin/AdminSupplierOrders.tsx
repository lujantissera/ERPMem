import { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { suppliersApi, productsApi } from '../../lib/api';
import type { SupplierOrder, SupplierOrderStatus, Supplier, Product } from '../../types';
import { SupplierStatusBadge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

const STATUSES: SupplierOrderStatus[] = ['DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED'];
const STATUS_LABELS: Record<SupplierOrderStatus, string> = {
  DRAFT: 'Borrador', SENT: 'Enviado', CONFIRMED: 'Confirmado',
  RECEIVED: 'Recibido', CANCELLED: 'Cancelado',
};

export default function AdminSupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    supplierId: '',
    notes: '',
    items: [{ productId: '', quantity: 1, unitCost: '' }],
  });

  useEffect(() => {
    Promise.all([
      suppliersApi.orders(),
      suppliersApi.list(),
      productsApi.listAdmin({ limit: 100 }),
    ]).then(([oRes, sRes, pRes]) => {
      setOrders(oRes.data);
      setSuppliers(sRes.data);
      setProducts(pRes.data.products);
    }).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: number, status: SupplierOrderStatus) => {
    setUpdatingId(id);
    try {
      const { data } = await suppliersApi.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { productId: '', quantity: 1, unitCost: '' }] }));

  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId) { toast.error('Seleccioná un proveedor'); return; }
    try {
      const { data } = await suppliersApi.createOrder({
        supplierId: parseInt(form.supplierId),
        notes: form.notes || undefined,
        items: form.items
          .filter((i) => i.productId)
          .map((i) => ({
            productId: parseInt(i.productId),
            quantity: i.quantity,
            unitCost: i.unitCost ? parseFloat(i.unitCost) : undefined,
          })),
      });
      setOrders((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ supplierId: '', notes: '', items: [{ productId: '', quantity: 1, unitCost: '' }] });
      toast.success('Orden de compra creada');
    } catch {
      toast.error('Error al crear la orden');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-dark">Órdenes de compra</h1>
          <p className="text-warm-muted text-sm mt-1">{orders.length} órdenes registradas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva orden
        </button>
      </div>

      {/* New order form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-warm-border p-6 mb-6">
          <h2 className="font-heading text-2xl font-bold text-dark mb-4">Nueva orden de compra</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-dark-3 mb-1">Proveedor *</label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                required
              >
                <option value="">Seleccionar proveedor</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-3 mb-1">Notas</label>
              <input
                type="text" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observaciones opcionales"
                className="w-full px-3 py-2.5 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-3 mb-2">Productos</label>
            <div className="flex flex-col gap-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => setForm((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, productId: e.target.value } : it) }))}
                    className="px-3 py-2 rounded-xl border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    type="number" min={1} value={item.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, quantity: parseInt(e.target.value) || 1 } : it) }))}
                    placeholder="Cantidad"
                    className="px-3 py-2 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number" min={0} step="0.01" value={item.unitCost}
                      onChange={(e) => setForm((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, unitCost: e.target.value } : it) }))}
                      placeholder="Costo unit. (opc.)"
                      className="flex-1 px-3 py-2 rounded-xl border border-warm-border focus:border-accent outline-none text-sm text-dark-3"
                    />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-danger hover:text-red-700 px-2">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 text-sm text-accent hover:underline font-medium">
              + Agregar producto
            </button>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Crear orden
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-warm-border text-dark-3 font-medium px-6 py-2.5 rounded-xl hover:bg-warm-bg transition-colors text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <PageSpinner />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-warm-border p-10 text-center text-warm-muted">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay órdenes de compra registradas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-warm-border overflow-hidden">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-warm-bg transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-heading text-lg font-bold text-dark">Orden #{order.id}</span>
                    <SupplierStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-dark-3">{order.supplier.name}</p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}{order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as SupplierOrderStatus)}
                    disabled={updatingId === order.id}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs border border-warm-border rounded-lg px-2 py-1.5 bg-white text-dark-3 focus:border-accent outline-none disabled:opacity-50"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  {expandedId === order.id
                    ? <ChevronUp className="w-4 h-4 text-warm-muted" />
                    : <ChevronDown className="w-4 h-4 text-warm-muted" />}
                </div>
              </div>

              {expandedId === order.id && (
                <div className="border-t border-warm-border px-5 py-4 bg-warm-bg">
                  {order.notes && (
                    <p className="text-sm text-dark-3 mb-3 italic">"{order.notes}"</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-dark-3">{item.product.name}</span>
                        <div className="flex items-center gap-4 text-warm-muted">
                          <span>× {item.quantity}</span>
                          {item.unitCost && (
                            <span className="font-medium text-dark-3">
                              ${Number(item.unitCost).toLocaleString('es-AR')} c/u
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
