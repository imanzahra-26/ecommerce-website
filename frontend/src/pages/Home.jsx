// ============================================
// HOME PAGE — product catalog
// ============================================
// Fetches all products on mount. Supports category filter + search box.
// Renders a responsive grid of ProductCards.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productApi';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Build params object — only include non-empty
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;

        const res = await getProducts(params);
        setProducts(res.data.products);
      } catch (err) {
        setError('Could not load products');
      } finally {
        setLoading(false);
      }
    };

    // Small debounce so typing doesn't spam the backend
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [category, search]);

  // Hardcoded categories (matches seed data)
  const categories = ['', 'Electronics', 'Footwear', 'Home', 'Stationery', 'Accessories'];

  return (
    <div className="page">
      <div className="home-header">
        <h1>Shop the latest</h1>
        <p>Hand-picked products at great prices.</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="category-chips">
          {categories.map((c) => (
            <button
              key={c || 'all'}
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && <p className="muted">Loading products…</p>}
      {error && <div className="alert-error">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <p className="muted">No products match your search.</p>
      )}

      {/* Grid */}
      <div className="product-grid">
        {products.map((p) => (
          <Link to={`/product/${p.id}`} key={p.id} className="product-card">
            <div className="product-image">
              <img src={p.image_url} alt={p.name} loading="lazy" />
            </div>
            <div className="product-info">
              <span className="product-category">{p.category}</span>
              <h3>{p.name}</h3>
              <div className="product-bottom">
                <span className="price">${Number(p.price).toFixed(2)}</span>
                <span className={`stock ${p.stock > 0 ? 'in' : 'out'}`}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}