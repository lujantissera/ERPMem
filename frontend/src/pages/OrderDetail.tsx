import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin } from 'lucide-react';
import { ordersApi } from '../lib/api';
import type { Order } from '../types';
import { OrderStatusBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED'] as const;
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', IN_PRODUCTION: 'En producción',
  SHIPPED: 'Enviado', DELIVERED: 'Entregado',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(Number(id))
      .then((r) => setOrder(r.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!order) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-warm-muted">Pedido no encontrado.</p>
      <Link to="/my-orders" className="text-accent hover:underline mt-3 inline-block">Ver mis pedidos</Link>
    </div>
  );

  const stepIdx = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/my-orders" className="flex items-center gap-1.5 text-warm-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Mis pedidos
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="font-heading text-4xl font-bold text-dark">Pedido #{order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Progress */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-white rounded-xl border border-warm-border p-6 mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-warm-border" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-accent transition-all"
                style={{ width: `${Math.max(0, (stepIdx / (STATUS_STEPS.length - 1)) * 100)}%` }}
              />
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    i <= stepIdx ? 'bg-accent border-accent text-white' : 'bg-white border-warm-border text-warm-muted'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-xs font-medium text-warm-muted hidden sm:block">{STATUS_LABELS[step]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-warm-border p-6">
            <h2 className="font-heading text-2xl font-bold text-dark mb-4">Productos</h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg bg-warm-bg-2 border border-warm-border flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.imageUrl
                      ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      : <Package className="w-6 h-6 text-warm-border" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-3 text-sm">{item.product.name}</p>
                    <p className="text-xs text-warm-muted">× {item.quantity}</p>
                    {(item.customWidth || item.customHeight || item.customDepth) && (
                      <p className="text-xs text-accent mt-0.5">
                        {[
                          item.customWidth && `A: ${item.customWidth}cm`,
                          item.customHeight && `H: ${item.customHeight}cm`,
                          item.customDepth && `P: ${item.customDepth}cm`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-dark shrink-0">
                    ${(Number(item.unitPrice) * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-warm-border mt-4 pt-4 flex justify-between">
              <span className="font-heading text-lg font-bold text-dark">Total</span>
              <span className="font-heading text-2xl font-bold text-accent">
                ${Number(order.total).toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-warm-border p-6">
              <h2 className="font-heading text-xl font-bold text-dark mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" /> Entrega
              </h2>
              <p className="text-dark-3 text-sm">{order.deliveryAddress}</p>
              <p className="text-dark-3 text-sm">{order.deliveryCity}, {order.deliveryPostal}</p>
              <p className="text-dark-3 text-sm">{order.deliveryCountry}</p>
              {order.notes && (
                <p className="text-warm-muted text-xs mt-2 italic">"{order.notes}"</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-warm-border p-6">
              <h2 className="font-heading text-xl font-bold text-dark mb-3">Información</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-warm-muted">Fecha</span>
                  <span className="text-dark-3 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-muted">Estado</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
