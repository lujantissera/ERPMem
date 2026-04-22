import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersApi, usersApi, productsApi } from '../../lib/api';
import type { Order, OrderStatus, User, Product } from '../../types';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', IN_PRODUCTION: 'En producción',
  SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
};

interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  customWidth: string;
  customHeight: string;
  customDepth: string;
}

interface OrderForm {
  userId: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostal: string;
  deliveryCountry: string;
  notes: string;
  items: OrderItem[];
}

const emptyForm: OrderForm = {
  userId: '', deliveryAddress: '', deliveryCity: '', deliveryPostal: '',
  deliveryCountry: 'Argentina', notes: '', items: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    ordersApi.listAdmin().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const openModal = async () => {
    setShowModal(true);
    if (users.length === 0) {
      const [u, p] = await Promise.all([usersApi.list(), productsApi.listAdmin({ limit: 200 })]);
      setUsers(u.data);
      setProducts(p.data.products.filter((pr) => pr.active));
    }
  };

  const closeModal = () => { setShowModal(false); setForm(emptyForm); setSelectedProductId(''); };

  const addItem = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (!product) return;
    const exists = form.items.find((i) => i.productId === product.id);
    if (exists) { toast.error('Ese producto ya está en la lista'); return; }
    setForm((f) => ({
      ...f,
      items: [...f.items, {
        productId: product.id,
        productName: product.name,
        unitPrice: Number(product.price),
        quantity: 1,
        customWidth: '', customHeight: '', customDepth: '',
      }],
    }));
    setSelectedProductId('');
  };

  const removeItem = (productId: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.productId !== productId) }));

  const updateItem = (productId: number, key: keyof OrderItem, value: string | number) =>
    setForm((f) => ({ ...f, items: f.items.map((i) => i.productId === productId ? { ...i, [key]: value } : i) }));

  const orderTotal = form.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId) { toast.error('Seleccioná un cliente'); return; }
    if (form.items.length === 0) { toast.error('Agregá al menos un producto'); return; }
    setSaving(true);
    try {
      const { data } = await ordersApi.createAdmin({
        userId: parseInt(form.userId),
        deliveryAddress: form.deliveryAddress,
        deliveryCity: form.deliveryCity,
        deliveryPostal: form.deliveryPostal,
        deliveryCountry: form.deliveryCountry || 'Argentina',
        notes: form.notes || undefined,
        items: form.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          customWidth: i.customWidth ? parseFloat(i.customWidth) : null,
          customHeight: i.customHeight ? parseFloat(i.customHeight) : null,
          customDepth: i.customDepth ? parseFloat(i.customDepth) : null,
        })),
      });
      setOrders((prev) => [data, ...prev]);
      closeModal();
      toast.success(`Pedido #${data.id} creado`);
    } catch (err: unknown) {
      const d = (err as { response?: { data?: { message?: string; errors?: string[] } } })?.response?.data;
      toast.error(d?.errors?.join(', ') || d?.message || 'Error al crear pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    setUpdatingId(id);
    try {
      const { data } = await ordersApi.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch = !search || `#${o.id} ${o.user?.name} ${o.user?.email}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-dark">Pedidos</h1>
          <p className="text-warm-muted text-sm mt-1">{orders.length} pedidos en total</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo pedido
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID o cliente..."
            className="pl-9 pr-4 py-2.5 rounded-xl border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3 w-64"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
          className="px-4 py-2.5 rounded-xl border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3 font-medium"
        >
          <option value="ALL">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
        <div className="bg-white rounded-xl border border-warm-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-warm-muted">No se encontraron pedidos</div>
          ) : (
            <div className="divide-y divide-warm-border">
              {filtered.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-lg font-bold text-dark">#{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-dark-3">{order.user?.name} — {order.user?.email}</p>
                    <p className="text-xs text-warm-muted mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}{order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
                      {' · '}{order.deliveryCity}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-heading text-xl font-bold text-accent">
                      ${Number(order.total).toLocaleString('es-AR')}
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updatingId === order.id}
                      className="text-xs border border-warm-border rounded-lg px-2 py-1.5 bg-white text-dark-3 focus:border-accent outline-none disabled:opacity-50"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>

                    <Link
                      to={`/my-orders/${order.id}`}
                      target="_blank"
                      className="text-warm-muted hover:text-accent transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Pedido */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border shrink-0">
              <h2 className="font-heading text-2xl font-bold text-dark">Nuevo pedido</h2>
              <button onClick={closeModal} className="p-2 text-warm-muted hover:text-dark rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Cliente */}
              <div>
                <label className="block text-xs font-medium text-dark-3 mb-1">Cliente <span className="text-danger">*</span></label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                >
                  <option value="">Seleccionar cliente...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>

              {/* Dirección de entrega */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-dark-3 mb-1">Dirección <span className="text-danger">*</span></label>
                  <input
                    type="text" value={form.deliveryAddress} required
                    onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-3 mb-1">Ciudad <span className="text-danger">*</span></label>
                  <input
                    type="text" value={form.deliveryCity} required
                    onChange={(e) => setForm((f) => ({ ...f, deliveryCity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-3 mb-1">Código postal <span className="text-danger">*</span></label>
                  <input
                    type="text" value={form.deliveryPostal} required
                    onChange={(e) => setForm((f) => ({ ...f, deliveryPostal: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-medium text-dark-3 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-dark-3 resize-none"
                />
              </div>

              {/* Agregar productos */}
              <div>
                <label className="block text-xs font-medium text-dark-3 mb-1">Agregar producto</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — ${Number(p.price).toLocaleString('es-AR')}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedProductId}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Lista de items */}
              {form.items.length > 0 && (
                <div className="space-y-3">
                  {form.items.map((item) => (
                    <div key={item.productId} className="bg-warm-border/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm text-dark-3">{item.productName}</span>
                        <button type="button" onClick={() => removeItem(item.productId)} className="text-warm-muted hover:text-danger transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-warm-muted mb-1">Cantidad</label>
                          <input
                            type="number" min={1} value={item.quantity}
                            onChange={(e) => updateItem(item.productId, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-warm-muted mb-1">Ancho (cm)</label>
                          <input
                            type="number" value={item.customWidth} placeholder="—"
                            onChange={(e) => updateItem(item.productId, 'customWidth', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-warm-muted mb-1">Alto (cm)</label>
                          <input
                            type="number" value={item.customHeight} placeholder="—"
                            onChange={(e) => updateItem(item.productId, 'customHeight', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-warm-muted mb-1">Prof. (cm)</label>
                          <input
                            type="number" value={item.customDepth} placeholder="—"
                            onChange={(e) => updateItem(item.productId, 'customDepth', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-warm-muted mt-2">
                        Subtotal: <span className="font-medium text-dark-3">${(item.unitPrice * item.quantity).toLocaleString('es-AR')}</span>
                      </p>
                    </div>
                  ))}
                  <div className="text-right">
                    <span className="font-heading text-lg font-bold text-accent">Total: ${orderTotal.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-warm-border text-dark-3 text-sm font-medium hover:bg-warm-border/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creando...' : 'Crear pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
