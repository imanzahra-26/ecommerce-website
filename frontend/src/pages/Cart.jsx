// ============================================
// CART PAGE (protected)
// ============================================
// Lists cart items, allows qty change + removal, and checkout.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem } from '../api/cartApi';
import { checkout } from '../api/orderApi';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const navigate = useNavigate();

  // Load cart on mount
  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      setError('Could not load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Change quantity (calls PUT /cart/:id)
  const changeQty = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(id, { quantity: newQty });
      await loadCart();  // refresh totals
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  // Remove line
  const remove = async (id) => {
    if (!window.confirm('Remove this item from cart?')) return;
    try {
      await removeCartItem(id);
      await loadCart();
    } catch (err) {
      alert('Remove failed');
    }
  };

  // Checkout → POST /orders → success → go to orders page
  const handleCheckout = async () => {
    setPlacing(true);
    try {
      const res = await checkout();
      navigate('/orders', { state: { justPlaced: res.data.order_id } });
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading cart…</p></div>;
  if (error)   return <div className="page"><div className="alert-error">{error}</div></div>;

  // Empty state
  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty.</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your cart</h1>

      <div className="cart-layout">
        {/* Left: list of items */}
        <div className="cart-items">
          {items.map((it) => (
            <div className="cart-item" key={it.id}>
              <img src={it.image_url} alt={it.name} />

              <div className="cart-item-info">
                <h3>{it.name}</h3>
                <p className="muted">{it.category}</p>
                <p className="price">${Number(it.price).toFixed(2)} each</p>
              </div>

              <div className="cart-item-actions">
                <div className="qty-selector small">
                  <button onClick={() => changeQty(it.id, it.quantity - 1)}>−</button>
                  <span>{it.quantity}</span>
                  <button onClick={() => changeQty(it.id, it.quantity + 1)}>+</button>
                </div>

                <div className="line-total">
                  ${Number(it.line_total).toFixed(2)}
                </div>

                <button className="btn-remove" onClick={() => remove(it.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: summary */}
        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>
          <div className="summary-row muted">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${Number(total).toFixed(2)}</span>
          </div>

          <button
            className="btn-primary full"
            onClick={handleCheckout}
            disabled={placing}
          >
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </aside>
      </div>
    </div>
  );
}