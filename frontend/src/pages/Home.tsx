import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productsApi, categoriesApi } from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { PageSpinner } from '../components/ui/Spinner';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 8 }),
      categoriesApi.list(),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.products);
      setCategories(cRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="bg-dark text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-warm-muted text-xs font-semibold uppercase tracking-[0.25em] mb-5">
                Materiales en Movimiento
              </p>
              <h1 className="font-heading text-[76px] lg:text-[112px] font-bold leading-none text-white mb-6">
                Líneas simples,<br />
                formas que<br />
                <span className="text-accent">parecen flotar.</span>
              </h1>
              <p className="text-warm-muted text-base lg:text-lg leading-relaxed mb-8 max-w-md">
                Sistema modular de sillones, camas, mesas y almohadones. Diseño gráfico, colores y medidas 100% personalizables.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-bold px-7 py-3.5 rounded-lg transition-colors text-base"
                >
                  Ver catálogo <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products"
                  className="flex items-center gap-2 border border-warm-border text-warm-border hover:text-white hover:border-white font-semibold px-7 py-3.5 rounded-lg transition-colors text-base"
                >
                  Personalizá el tuyo
                </Link>
              </div>
            </div>

            {/* Right side: feature pills */}
            <div className="flex flex-col gap-3 lg:items-end">
              {[
                { label: 'Módulos que se combinan', sub: 'Armá distintas configuraciones' },
                { label: 'Fundas intercambiables', sub: 'Cambiá el color cuando quieras' },
                { label: 'Medidas personalizadas', sub: 'A la medida de tu colchón y espacio' },
              ].map(({ label, sub }) => (
                <div key={label} className="flex items-center gap-4 bg-dark-2 border border-dark-3 rounded-xl px-5 py-4 w-full lg:max-w-sm">
                  <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  <div>
                    <p className="font-heading text-lg font-bold text-white leading-tight">{label}</p>
                    <p className="text-warm-muted text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot separator */}
        <div className="flex items-center gap-1 px-4 sm:px-8 pb-0 overflow-hidden">
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-dark-3 shrink-0" />
          ))}
        </div>
      </section>

      {/* CATEGORIES BAR */}
      {categories.length > 0 && (
        <section className="bg-dark border-b border-dark-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 overflow-x-auto">
            <span className="text-warm-muted text-xs font-semibold uppercase tracking-widest shrink-0">Categorías</span>
            <div className="w-px h-4 bg-dark-3 shrink-0" />
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="shrink-0 px-4 py-1.5 bg-transparent hover:bg-accent border border-dark-3 hover:border-accent text-warm-border hover:text-white text-sm font-semibold rounded-full transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FLAGSHIP PRODUCT HIGHLIGHT */}
      <section className="bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-heading text-5xl lg:text-6xl font-bold text-dark">Productos</h2>
            <Link to="/products" className="flex items-center gap-1.5 text-accent text-sm font-bold hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <PageSpinner />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* PERSONALIZABLE SECTION */}
      <section className="bg-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-6xl lg:text-8xl font-bold leading-none mb-4">
                100%<br />Personalizable
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-md">
                Elegís la madera, el tapizado, los vivos y las medidas. Módulos que se combinan para armar el living, el dormitorio o el espacio que imaginás.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-yellow hover:bg-yellow-dark text-dark font-bold px-7 py-3.5 rounded-lg transition-colors text-base"
              >
                Personalizá el tuyo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'Maderas', items: ['Natural', 'Nogal', 'Laqueado blanco', 'Laqueado negro'] },
                { title: 'Tapizados', items: ['Gris', 'Beige arena', 'Verde', 'Personalizado'] },
                { title: 'Detalles', items: ['Vivo rojo', 'Vivo negro', 'Sin vivo', 'A elección'] },
              ].map(({ title, items }) => (
                <div key={title} className="bg-accent-dark/50 rounded-xl p-4">
                  <p className="font-heading text-xl font-bold text-white mb-3">{title}</p>
                  <div className="flex flex-col gap-1.5">
                    {items.map((item) => (
                      <span key={item} className="text-blue-100 text-sm">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="bg-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-5xl lg:text-6xl font-bold text-dark leading-tight">
              ¿Encontraste<br />el tuyo?
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              to="/products"
              className="flex items-center gap-2 bg-dark hover:bg-dark-3 text-white font-bold px-8 py-4 rounded-lg transition-colors text-lg"
            >
              Ir a la tienda <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-dark-3 hover:text-dark underline underline-offset-2"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark text-warm-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-heading text-3xl font-bold text-white">MEM</p>
            <p className="text-xs mt-0.5 uppercase tracking-widest">Materiales en Movimiento</p>
          </div>
          <div className="flex flex-col sm:items-end gap-1 text-xs">
            <p>© {new Date().getFullYear()} Materiales en Movimiento</p>
            <a
              href="https://www.instagram.com/materialesenmovimiento"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              @materialesenmovimiento
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
