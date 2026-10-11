// ============================================
// AUTH CONTEXT — global login state
// ============================================
// Any component can use:
//   const { user, token, login, register, logout, loading } = useAuth();
// Values are persisted in localStorage so a refresh keeps you logged in.

import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser, getMe } from '../api/authApi';

// Create the context
const AuthContext = createContext(null);

// Provider component — wraps the whole app (in main.jsx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount: if we have a token in localStorage, verify it and load the user
  useEffect(() => {
    const restore = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();           // hits /auth/me
        setUser(res.data.user);
      } catch (err) {
        // Token bad → clean up
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // Save to localStorage + state after successful login/register
  const persist = (userObj, tokenStr) => {
    localStorage.setItem('token', tokenStr);
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    setToken(tokenStr);
  };

  // Log in
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    persist(res.data.user, res.data.token);
    return res.data.user;
  };

  // Register
  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    persist(res.data.user, res.data.token);
    return res.data.user;
  };

  // Log out
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — clean way to use the context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}