import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-warm-bg flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-warm-muted">
          <ShoppingBag className="w-20 h-20 opacity-20" />
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-dark mb-2">Tu carrito está vacío</p>
            <p className="text-warm-muted">Agregá productos para empezar</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Package className="w-4 h-4" />
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col">      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <h1 className="font-heading text-5xl font-bold text-dark mb-8">Carrito</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-xl border border-warm-border p-5 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-warm-bg-2 border border-warm-border flex items-center justify-center overflow-hidden shrink-0">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-warm-border" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.id}`} className="font-heading text-xl font-bold text-dark hover:text-accent transition-colors leading-tight block">
                    {item.product.name}
                  </Link>
                  <p className="text-warm-muted text-sm mt-0.5">{item.product.category.name}</p>

                  {(item.customWidth || item.customHeight || item.customDepth) && (
                    <p className="text-xs text-accent mt-1 font-medium">
                      {[
                        item.customWidth && `Ancho: ${item.customWidth}cm`,
                        item.customHeight && `Alto: ${item.customHeight}cm`,
                        item.customDepth && `Prof: ${item.customDepth}cm`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-warm-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-dark-3 hover:bg-warm-bg-2 transition-colors font-bold"
                      >−</button>
                      <span className="w-10 text-center text-sm font-medium text-dark-3">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-dark-3 hover:bg-warm-bg-2 transition-colors font-bold"
                      >+</button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-heading text-xl font-bold text-accent">
                        ${(Number(item.product.price) * item.quantity).toLocaleString('es-AR')}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-warm-muted hover:text-danger transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/products" className="flex items-center gap-1.5 text-warm-muted hover:text-accent text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Seguir comprando
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-warm-border p-6 sticky top-24">
              <h2 className="font-heading text-2xl font-bold text-dark mb-5">Resumen</h2>

              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm text-dark-3">
                    <span className="truncate mr-2">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium shrink-0">${(Number(item.product.price) * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-warm-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-xl font-bold text-dark">Total</span>
                  <span className="font-heading text-3xl font-bold text-accent">
                    ${totalPrice().toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login', { state: { from: '/checkout' } }); return; }
                  navigate('/checkout');
                }}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Finalizar pedido
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-warm-muted mt-3">
                  Necesitás{' '}
                  <Link to="/login" className="text-accent hover:underline">iniciar sesión</Link>
                  {' '}para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
