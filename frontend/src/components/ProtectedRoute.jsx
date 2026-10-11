// Redirects to /login if the user isn't authenticated.
// Wrap any page that requires login with this.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While we're checking the token (on first load), show nothing
  if (loading) return <div className="page-loading">Loading…</div>;

  // Not logged in → bounce to /login, but remember where they wanted to go
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Logged in → render the actual page
  return children;
}