import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '../lib/api';
import type { Order } from '../types';
import { OrderStatusBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.myOrders()
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <h1 className="font-heading text-5xl font-bold text-dark mb-8">Mis pedidos</h1>

        {loading ? (
          <PageSpinner />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-warm-muted">
            <Package className="w-16 h-16 opacity-20" />
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-dark mb-1">Sin pedidos aún</p>
              <p>Todavía no realizaste ningún pedido.</p>
            </div>
            <Link to="/products" className="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/my-orders/${order.id}`}
                className="bg-white rounded-xl border border-warm-border hover:border-accent hover:shadow-sm transition-all p-5 flex items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-heading text-xl font-bold text-dark">Pedido #{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-warm-muted">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {' · '}
                    {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    {order.deliveryAddress}, {order.deliveryCity}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-heading text-2xl font-bold text-accent">
                    ${Number(order.total).toLocaleString('es-AR')}
                  </span>
                  <ChevronRight className="w-5 h-5 text-warm-muted group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
