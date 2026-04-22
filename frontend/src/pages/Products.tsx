import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Package } from 'lucide-react';
import { productsApi, categoriesApi } from '../lib/api';
import type { Product, Category, Pagination } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { PageSpinner } from '../components/ui/Spinner';
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productsApi.list({ categoryId, search: search || undefined, page, limit: 12 });
      setProducts(data.products);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [categoryId, search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoriesApi.list().then((r) => setCategories(r.data)); }, []);

  const setParam = (key: string, val: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="flex flex-col min-h-screen bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <h1 className="font-heading text-5xl font-bold text-dark mb-8">Catálogo</h1>

        {/* Search + filters toggle */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setParam('search', e.target.value || undefined)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-dark-3 text-sm"
            />
            {search && (
              <button onClick={() => setParam('search', undefined)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted hover:text-dark">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-medium ${showFilters ? 'bg-accent border-accent text-white' : 'bg-white border-warm-border text-dark-3 hover:border-accent'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-warm-border p-5 mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-2">Categoría</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setParam('categoryId', undefined)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${!categoryId ? 'bg-accent border-accent text-white' : 'bg-white border-warm-border text-dark-3 hover:border-accent'}`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setParam('categoryId', categoryId === cat.id ? undefined : String(cat.id))}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${categoryId === cat.id ? 'bg-accent border-accent text-white' : 'bg-white border-warm-border text-dark-3 hover:border-accent'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filters */}
        {(categoryId || search) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {categoryId && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-sm rounded-full font-medium">
                {categories.find((c) => c.id === categoryId)?.name}
                <button onClick={() => setParam('categoryId', undefined)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-sm rounded-full font-medium">
                "{search}"
                <button onClick={() => setParam('search', undefined)}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <PageSpinner />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-warm-muted gap-3">
            <Package className="w-14 h-14 opacity-25" />
            <p className="font-medium">No se encontraron productos</p>
            {(search || categoryId) && (
              <button
                onClick={() => setSearchParams({})}
                className="text-accent text-sm hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-warm-muted">
                {pagination?.total} producto{pagination?.total !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(p));
                      setSearchParams(next);
                    }}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      p === pagination.page
                        ? 'bg-accent text-white'
                        : 'bg-white border border-warm-border text-dark-3 hover:border-accent'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
