import { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../api/products';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';
import { parseCategoryFromDescription, stripMetaTags } from '../utils/meta';

interface ProductsProps {
  prefillSearch?: string;
}

export function Products({ prefillSearch }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState(prefillSearch || '');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fromSession = sessionStorage.getItem('senkulatharu_products_search_prefill');
    if (fromSession) {
      setSearch(fromSession);
      sessionStorage.removeItem('senkulatharu_products_search_prefill');
    }
  }, []);

  useEffect(() => {
    if (prefillSearch) {
      setSearch(prefillSearch);
    }
  }, [prefillSearch]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        setError('Unable to fetch products right now. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const categories = useMemo(() => {
    const bucket = new Map<string, number>();
    for (const product of products) {
      const value = parseCategoryFromDescription(product.description || '');
      bucket.set(value, (bucket.get(value) ?? 0) + 1);
    }

    const sorted = [...bucket.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return [{ name: 'All', count: products.length }, ...sorted.map(([name, count]) => ({ name, count }))];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const clean = stripMetaTags(product.description || '').toLowerCase();
      const bySearch = product.name.toLowerCase().includes(search.toLowerCase()) || clean.includes(search.toLowerCase());
      const byCategory = category === 'All' || parseCategoryFromDescription(product.description || '') === category;
      return bySearch && byCategory;
    });
  }, [products, search, category]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-forest to-moss p-8 text-white shadow-glass">
        <h1 className="font-headline text-4xl">Products</h1>
        <p className="mt-2 text-cream/90">Explore naturally grown produce from dryland farmers. Search, filter by category, and order directly on WhatsApp.</p>
      </section>

      <section className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-glass">
        <label htmlFor="search" className="mb-2 block text-sm font-bold text-brown">
          Search Products
        </label>
        <input
          id="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by product name or description"
          className="w-full rounded-xl border border-sand bg-white px-4 py-3 outline-none ring-forest/30 focus:ring"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item.name}
              onClick={() => setCategory(item.name)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                category === item.name ? 'bg-forest text-white' : 'bg-forest/10 text-forest'
              }`}
            >
              {item.name} ({item.count})
            </button>
          ))}
        </div>
      </section>

      {loading && <p className="rounded-2xl bg-white/70 p-6 text-center text-brown">Loading products...</p>}
      {!loading && error && <p className="rounded-2xl bg-clay/10 p-6 text-center text-clay">{error}</p>}
      {!loading && !error && products.length === 0 && <p className="rounded-2xl bg-white/70 p-6 text-center text-brown">No products available yet.</p>}
      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <p className="rounded-2xl bg-white/70 p-6 text-center text-brown">No matching products found for your filters.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
