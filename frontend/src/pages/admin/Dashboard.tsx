import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Users, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { ordersApi } from '../../lib/api';
import type { DashboardStats } from '../../types';
import { OrderStatusBadge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.dashboard().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (!stats) return null;

  const cards = [
    { label: 'Pedidos totales', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pedidos pendientes', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Ingresos totales', value: `$${stats.totalRevenue.toLocaleString('es-AR')}`, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Productos activos', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Clientes', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Stock bajo', value: stats.lowStockCount, icon: AlertTriangle, color: stats.lowStockCount > 0 ? 'text-danger' : 'text-success', bg: stats.lowStockCount > 0 ? 'bg-red-50' : 'bg-green-50' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-dark">Dashboard</h1>
        <p className="text-warm-muted text-sm mt-1">Resumen general del negocio</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-warm-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-warm-muted">{label}</p>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className={`font-heading text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-warm-border">
        <div className="flex items-center justify-between p-5 border-b border-warm-border">
          <h2 className="font-heading text-2xl font-bold text-dark">Pedidos recientes</h2>
          <Link to="/admin/orders" className="text-sm text-accent font-medium hover:underline">Ver todos</Link>
        </div>
        <div className="divide-y divide-warm-border">
          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-warm-muted">Sin pedidos aún</div>
          ) : (
            stats.recentOrders.map((order) => (
              <Link key={order.id} to={`/admin/orders`} className="flex items-center justify-between px-5 py-4 hover:bg-warm-bg transition-colors">
                <div>
                  <p className="font-medium text-dark-3 text-sm">Pedido #{order.id} — {order.user?.name}</p>
                  <p className="text-xs text-warm-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-heading text-xl font-bold text-accent">
                    ${Number(order.total).toLocaleString('es-AR')}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {stats.lowStockCount > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">
            {stats.lowStockCount} producto{stats.lowStockCount !== 1 ? 's' : ''} con stock bajo.{' '}
            <Link to="/admin/products" className="underline">Ver productos</Link>
          </p>
        </div>
      )}
    </div>
  );
}
