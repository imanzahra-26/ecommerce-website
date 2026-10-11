// ============================================
// MY ORDERS PAGE (protected)
// ============================================
// Two views in one:
//   1. List of orders (default)
//   2. Order detail (when an order id is selected)

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyOrders, getOrderById } from '../api/orderApi';

export default function Orders() {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Currently opened order detail (null = show list)
  const [openOrder, setOpenOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load list on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getMyOrders();
        setOrders(res.data.orders);

        // If we just placed an order, auto-open its detail
        const justPlaced = location.state?.justPlaced;
        if (justPlaced) openDetail(justPlaced);
      } catch (err) {
        setError('Could not load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open one order's detail
  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await getOrderById(id);
      setOpenOrder(res.data);
    } catch (err) {
      alert('Could not load order');
    } finally {
      setDetailLoading(false);
    }
  };

  // ---- Render: detail view ----
  if (openOrder) {
    const { order, items } = openOrder;
    return (
      <div className="page">
        <button className="back-link" onClick={() => setOpenOrder(null)}>
          ← Back to orders
        </button>

        <h1>Order #{order.id}</h1>
        <p className="muted">
          Placed on {new Date(order.created_at).toLocaleString()} — Status:{' '}
          <span className={`status status-${order.status}`}>{order.status}</span>
        </p>

        <div className="order-detail-items">
          {items.map((it) => (
            <div className="order-line" key={it.id}>
              <img src={it.image_url} alt={it.name} />
              <div className="order-line-info">
                <h4>{it.name}</h4>
                <p className="muted">
                  ${Number(it.price_at_purchase).toFixed(2)} × {it.quantity}
                </p>
              </div>
              <div className="line-total">
                ${Number(it.line_total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="order-total-row">
          <strong>Total: ${Number(order.total_amount).toFixed(2)}</strong>
        </div>
      </div>
    );
  }

  // ---- Render: list view ----
  if (loading) return <div className="page"><p className="muted">Loading orders…</p></div>;
  if (error)   return <div className="page"><div className="alert-error">{error}</div></div>;

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>My orders</h1>
        <p className="muted">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My orders</h1>

      {detailLoading && <p className="muted">Loading order…</p>}

      <div className="orders-list">
        {orders.map((o) => (
          <button
            key={o.id}
            className="order-card"
            onClick={() => openDetail(o.id)}
          >
            <div>
              <strong>Order #{o.id}</strong>
              <p className="muted">
                {new Date(o.created_at).toLocaleDateString()} · {o.item_count} item
                {o.item_count > 1 ? 's' : ''}
              </p>
            </div>
            <div className="order-right">
              <span className={`status status-${o.status}`}>{o.status}</span>
              <strong>${Number(o.total_amount).toFixed(2)}</strong>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}