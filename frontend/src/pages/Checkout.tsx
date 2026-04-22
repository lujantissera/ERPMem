import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersApi } from '../lib/api';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    deliveryCity: '',
    deliveryPostal: '',
    deliveryCountry: 'Argentina',
    notes: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('El carrito está vacío'); return; }
    setLoading(true);
    try {
      const { data } = await ordersApi.create({
        ...form,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          customWidth: i.customWidth ?? null,
          customHeight: i.customHeight ?? null,
          customDepth: i.customDepth ?? null,
        })),
      });
      clearCart();
      toast.success('¡Pedido realizado con éxito!');
      navigate(`/my-orders/${data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <h1 className="font-heading text-5xl font-bold text-dark mb-8">Finalizar pedido</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-warm-border p-6">
              <h2 className="font-heading text-2xl font-bold text-dark mb-5">Datos de entrega</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-3 mb-1.5">Dirección *</label>
                  <input
                    type="text" required value={form.deliveryAddress} onChange={set('deliveryAddress')}
                    className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                    placeholder="Av. Corrientes 1234, Piso 3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-3 mb-1.5">Ciudad *</label>
                    <input
                      type="text" required value={form.deliveryCity} onChange={set('deliveryCity')}
                      className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                      placeholder="Buenos Aires"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-3 mb-1.5">Código postal *</label>
                    <input
                      type="text" required value={form.deliveryPostal} onChange={set('deliveryPostal')}
                      className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                      placeholder="1043"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-3 mb-1.5">País</label>
                  <input
                    type="text" value={form.deliveryCountry} onChange={set('deliveryCountry')}
                    className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-3 mb-1.5">Notas del pedido</label>
                  <textarea
                    value={form.notes} onChange={set('notes')} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-warm-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3 resize-none"
                    placeholder="Instrucciones especiales, piso, horario preferido..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
            >
              <CheckCircle className="w-5 h-5" />
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-warm-border p-6 sticky top-24">
              <h2 className="font-heading text-2xl font-bold text-dark mb-5">Tu pedido</h2>
              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-warm-bg-2 flex items-center justify-center shrink-0 border border-warm-border overflow-hidden">
                      {item.product.imageUrl
                        ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        : <Package className="w-5 h-5 text-warm-border" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-3 truncate">{item.product.name}</p>
                      <p className="text-xs text-warm-muted">× {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-dark shrink-0">
                      ${(Number(item.product.price) * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-warm-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-xl font-bold text-dark">Total</span>
                  <span className="font-heading text-3xl font-bold text-accent">
                    ${totalPrice().toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
