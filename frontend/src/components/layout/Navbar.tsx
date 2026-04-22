import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

const NAV_LINKS = [
  { to: '/products', label: 'Tienda' },
  { to: '/products?search=sillon', label: 'Sillones' },
  { to: '/products?search=cama', label: 'Camas' },
  { to: '/products?search=mesa', label: 'Mesas' },
  { to: '/products?search=almohadon', label: 'Almohadones' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <header className="bg-dark border-b border-dark-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-6">

          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-3xl font-bold text-white tracking-tight shrink-0 hover:text-yellow transition-colors"
            onClick={() => setOpen(false)}
          >
            MEM
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className="px-3 py-1.5 text-sm font-medium text-warm-border hover:text-white hover:bg-dark-3 rounded-md transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {user?.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold bg-accent hover:bg-accent-dark text-white px-3 py-1.5 rounded-md transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin
              </NavLink>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/my-orders"
                  className="hidden md:block text-sm font-medium text-warm-muted hover:text-white px-2 py-1.5 rounded-md transition-colors"
                >
                  {user?.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center justify-center w-8 h-8 text-warm-muted hover:text-danger rounded-md transition-colors"
                  title="Salir"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-warm-muted hover:text-white px-2 py-1.5 rounded-md transition-colors">
                  Ingresar
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-yellow hover:bg-yellow-dark text-dark px-3 py-1.5 rounded-md transition-colors">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-9 h-9 text-warm-muted hover:text-white hover:bg-dark-3 rounded-md transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile toggle */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 text-warm-muted hover:text-white hover:bg-dark-3 rounded-md transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-dark-3 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={label} to={to} onClick={() => setOpen(false)}
                className="text-sm font-medium text-warm-border hover:text-white hover:bg-dark-3 px-3 py-2.5 rounded-md transition-colors">
                {label}
              </Link>
            ))}
            <div className="border-t border-dark-3 mt-2 pt-2 flex flex-col gap-1">
              {user?.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-accent px-3 py-2.5 rounded-md">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/my-orders" onClick={() => setOpen(false)} className="text-sm font-medium text-warm-border px-3 py-2.5 rounded-md">
                    Mis pedidos
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-danger px-3 py-2.5 rounded-md text-left">
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-warm-border px-3 py-2.5 rounded-md">Ingresar</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="text-sm font-semibold text-dark bg-yellow px-3 py-2.5 rounded-md">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
