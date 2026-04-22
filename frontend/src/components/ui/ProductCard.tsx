import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import type { Product } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const hasCustomDims = product.minWidth || product.minHeight || product.minDepth;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success('Agregado al carrito');
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl border border-warm-border hover:border-accent hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-warm-bg-2 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-14 h-14 text-warm-border" />
        )}
        {hasCustomDims && (
          <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            A medida
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-dark text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Sin stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <span className="text-[10px] font-bold text-warm-muted uppercase tracking-widest">
            {product.category.name}
          </span>
          <h3 className="font-heading text-xl font-bold text-dark leading-tight mt-0.5 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          {product.material && (
            <p className="text-xs text-warm-muted mt-0.5">{product.material}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-warm-border">
          <span className="font-heading text-2xl font-bold text-dark">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>

          {!hasCustomDims && product.stock > 0 && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors uppercase tracking-wide"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Agregar
            </button>
          )}

          {hasCustomDims && (
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">Ver opciones →</span>
          )}

          {product.stock === 0 && !hasCustomDims && (
            <span className="text-xs font-medium text-warm-muted">Sin stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
