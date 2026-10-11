// ============================================
// AXIOS INSTANCE
// ============================================
// One shared HTTP client for the whole app.
// - Adds baseURL so we don't repeat http://localhost:5000/api everywhere
// - Adds JWT token from localStorage to every request
// - Redirects to /login on 401 (token expired)

import axios from 'axios';

// Create the instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // from frontend/.env
  headers: { 'Content-Type': 'application/json' }
});

// ============================================
// REQUEST INTERCEPTOR — attach token
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Backend expects: Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR — handle 401
// ============================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid/expired — clear and bounce to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;