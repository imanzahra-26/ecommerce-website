// Top navigation bar — logo, links, cart badge, login/logout.
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cartApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // Refresh cart count whenever user changes (login/logout) or a cart event fires
  useEffect(() => {
    if (!user) { setCartCount(0); return; }

    const fetchCount = async () => {
      try {
        const res = await getCart();
        const count = res.data.items.reduce((s, i) => s + i.quantity, 0);
        setCartCount(count);
      } catch { /* ignore */ }
    };

    fetchCount();

    // Listen for a custom event we'll dispatch after cart updates
    window.addEventListener('cart:updated', fetchCount);
    return () => window.removeEventListener('cart:updated', fetchCount);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">🛍️ ShopEase</Link>

      <div className="nav-links">
        <Link to="/">Products</Link>

        {user && (
          <Link to="/cart">
            Cart{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        )}
        {user && <Link to="/orders">My Orders</Link>}

        {user ? (
          <div className="nav-user">
            <span>Hi, {user.name.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}