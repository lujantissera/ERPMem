import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsApi } from '../lib/api';
import type { Product } from '../types';
import { useCartStore } from '../stores/cartStore';
import { PageSpinner } from '../components/ui/Spinner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [dims, setDims] = useState({ width: '', height: '', depth: '' });
  const addItem = useCartStore((s) => s.addItem);

  const hasCustomDims = product && (product.minWidth || product.minHeight || product.minDepth);

  useEffect(() => {
    productsApi.get(Number(id))
      .then((r) => setProduct(r.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;

    if (hasCustomDims) {
      const w = dims.width ? parseFloat(dims.width) : null;
      const h = dims.height ? parseFloat(dims.height) : null;
      const d = dims.depth ? parseFloat(dims.depth) : null;

      if (product.minWidth && product.maxWidth && w !== null) {
        if (w < product.minWidth || w > product.maxWidth) {
          toast.error(`Ancho debe ser entre ${product.minWidth} y ${product.maxWidth} cm`);
          return;
        }
      }
      if (product.minHeight && product.maxHeight && h !== null) {
        if (h < product.minHeight || h > product.maxHeight) {
          toast.error(`Alto debe ser entre ${product.minHeight} y ${product.maxHeight} cm`);
          return;
        }
      }
      addItem(product, qty, { customWidth: w, customHeight: h, customDepth: d });
    } else {
      addItem(product, qty);
    }
    toast.success('Agregado al carrito');
  };

  if (loading) return <PageSpinner />;
  if (!product) return (
    <div className="min-h-screen bg-warm-bg">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-warm-muted text-lg">Producto no encontrado.</p>
        <Link to="/products" className="text-accent hover:underline mt-4 inline-block">Volver al catálogo</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="flex items-center gap-1.5 text-warm-muted hover:text-accent text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square bg-warm-bg-2 rounded-2xl overflow-hidden flex items-center justify-center border border-warm-border">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-24 h-24 text-warm-border" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <Link to={`/products?categoryId=${product.categoryId}`} className="text-sm text-accent font-medium hover:underline uppercase tracking-wider">
                {product.category.name}
              </Link>
              <h1 className="font-heading text-5xl font-bold text-dark mt-2 leading-tight">{product.name}</h1>
              {product.material && (
                <p className="text-warm-muted text-sm mt-1">Material: <span className="text-dark-3 font-medium">{product.material}</span></p>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-heading text-5xl font-bold text-accent">
                ${Number(product.price).toLocaleString('es-AR')}
              </span>
            </div>

            <p className="text-dark-3 leading-relaxed">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`} />
              <span className="text-sm font-medium text-dark-3">
                {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
              </span>
            </div>

            {/* Custom dims */}
            {hasCustomDims && (
              <div className="bg-warm-bg-2 rounded-xl p-5 border border-warm-border">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="w-4 h-4 text-accent" />
                  <p className="font-heading text-lg font-bold text-dark">Medidas personalizadas (cm)</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {product.minWidth && (
                    <div>
                      <label className="block text-xs font-medium text-warm-muted mb-1">
                        Ancho ({product.minWidth}–{product.maxWidth})
                      </label>
                      <input
                        type="number" value={dims.width} onChange={(e) => setDims({ ...dims, width: e.target.value })}
                        min={product.minWidth} max={product.maxWidth ?? undefined} step="1"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                        placeholder={String(product.minWidth)}
                      />
                    </div>
                  )}
                  {product.minHeight && (
                    <div>
                      <label className="block text-xs font-medium text-warm-muted mb-1">
                        Alto ({product.minHeight}–{product.maxHeight})
                      </label>
                      <input
                        type="number" value={dims.height} onChange={(e) => setDims({ ...dims, height: e.target.value })}
                        min={product.minHeight} max={product.maxHeight ?? undefined} step="1"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                        placeholder={String(product.minHeight)}
                      />
                    </div>
                  )}
                  {product.minDepth && (
                    <div>
                      <label className="block text-xs font-medium text-warm-muted mb-1">
                        Prof. ({product.minDepth}–{product.maxDepth})
                      </label>
                      <input
                        type="number" value={dims.depth} onChange={(e) => setDims({ ...dims, depth: e.target.value })}
                        min={product.minDepth} max={product.maxDepth ?? undefined} step="1"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white focus:border-accent outline-none text-sm text-dark-3"
                        placeholder={String(product.minDepth)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-warm-border rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 flex items-center justify-center text-dark-3 hover:bg-warm-bg-2 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-dark-3">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-11 h-11 flex items-center justify-center text-dark-3 hover:bg-warm-bg-2 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
