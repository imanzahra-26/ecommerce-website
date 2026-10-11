// ============================================
// LOGIN PAGE
// ============================================
// Email + password form. On submit, calls login() from AuthContext.
// On success, redirects to home (or back to wherever user came from).

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  // Controlled inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks for navigation
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Where to send user after login (default = home)
  const from = location.state?.from?.pathname || '/';

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();          // stop page reload
    setError('');
    setLoading(true);
    try {
      await login(email, password);   // from AuthContext
      navigate(from, { replace: true });
    } catch (err) {
      // Backend sends { message: "..." } on 401
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-sub">Log in to continue shopping.</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-foot">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}