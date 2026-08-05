import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { Pagination } from '../components/Pagination';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { showToast } from '../utils/toast';
import { PRODUCT_CATEGORIES } from '../config/constants.js';
import { BackButton } from '../components/BackButton';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
      const data = await productService.getAllProducts({ search, category, sortBy: sort === 'price-asc' ? 'price' : sort === 'price-desc' ? '-price' : '-createdAt', page, limit: 6 });
      const items = data.data || [];
      setProducts(items);
      setTotalPages(data.pagination?.pages || 1);
      setTotalResults(data.pagination?.totalDocs ?? data.total ?? items.length ?? 0);
      } catch {
        showToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, category, sort, page]);

  // Debounce the search input so we don't flood the API while typing
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(query.trim());
    }, 420);
    return () => clearTimeout(t);
  }, [query]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      showToast('Added to cart', 'success');
    } catch (err) {
      showToast('Failed to add product', 'error');
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-6">
        <BackButton fallbackPath="/" />
      </div>
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-label mb-2">Catalog</p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-accent sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-ink/80 dark:text-accent/80">Browse curated Himalayan essentials with search, filtering, and pagination.</p>
          <p className="mt-2 text-sm text-ink/70 dark:text-accent/70">Showing <strong className="text-ink/90 dark:text-accent">{totalResults}</strong> results{search ? ` for "${search}"` : ''}</p>
        </div>

        <div className="grid w-full gap-3 md:w-auto md:grid-cols-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="input-field md:col-span-2"
          />
          <button
            onClick={() => { setQuery(''); setSearch(''); setPage(1); }}
            className="hidden items-center justify-center rounded-md border px-3 py-2 text-sm md:flex"
            aria-label="Clear search"
          >
            Clear
          </button>

          <select
            value={category}
            onChange={(e) => { setPage(1); setCategory(e.target.value); }}
            className="input-field"
          >
            <option value="all">All Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => { setPage(1); setSort(e.target.value); }}
            className="input-field"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {products.length === 0 ? (
            <div className="card p-12 text-center">
              <h2 className="font-display text-2xl font-semibold mb-3 text-ink dark:text-accent">No products found</h2>
              <p className="text-ink/80 dark:text-accent/80">Try resetting your filters or search terms to see the full catalog.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={!isAdmin ? () => handleAddToCart(product) : undefined}
                />
              ))}
            </div>
          )}

          {products.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          )}
        </>
      )}
    </div>
  );
};

