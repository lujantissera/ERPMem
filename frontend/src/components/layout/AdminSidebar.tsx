import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Tags, Users, Truck, ClipboardList, LogOut, ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Productos' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/categories', icon: Tags, label: 'Categorías' },
  { to: '/admin/users', icon: Users, label: 'Clientes' },
  { to: '/admin/suppliers', icon: Truck, label: 'Proveedores' },
  { to: '/admin/supplier-orders', icon: ClipboardList, label: 'Órdenes de compra' },
];

export default function AdminSidebar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-60 bg-dark min-h-screen flex flex-col shrink-0 border-r border-dark-3">
      <div className="px-5 py-5 border-b border-dark-3">
        <p className="font-heading text-3xl font-bold text-white tracking-tight">MEM</p>
        <p className="text-[10px] text-warm-muted uppercase tracking-[0.2em] mt-0.5">Admin</p>
        {user && <p className="text-xs text-warm-muted mt-2 truncate">{user.name}</p>}
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-warm-muted hover:bg-dark-2 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-dark-3 flex flex-col gap-0.5">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-warm-muted hover:text-white hover:bg-dark-2 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Ir a la tienda
        </NavLink>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-warm-muted hover:text-danger hover:bg-dark-2 transition-all w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
