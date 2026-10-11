// ============================================
// PRODUCT DETAIL PAGE
// ============================================
// Shows a single product + quantity selector + Add to cart.
// Requires login to add (backend enforces it too).

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Fetch product on mount / id change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getProductById(id);
        setProduct(res.data.product);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Add to cart handler
  const handleAdd = async () => {
    // If not logged in → send to login, then come back here
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }

    setAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: qty });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  // Loading / error states
  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="page"><div className="alert-error">{error}</div></div>;
  if (!product) return null;

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to products</Link>

      <div className="product-detail">
        <div className="detail-image">
          <img src={product.image_url} alt={product.name} />
        </div>

        <div className="detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-price">${Number(product.price).toFixed(2)}</div>

          <p className={`stock ${product.stock > 0 ? 'in' : 'out'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="detail-actions">
              <div className="qty-selector">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                >
                  +
                </button>
              </div>

              <button
                className="btn-primary"
                onClick={handleAdd}
                disabled={adding}
              >
                {adding ? 'Adding…' : added ? '✓ Added!' : 'Add to cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}