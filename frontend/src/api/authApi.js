// Auth-related API calls
import api from './axios';

// Create a new account. Returns { user, token }
export const registerUser = (data) => api.post('/auth/register', data);

// Log in. Returns { user, token }
export const loginUser = (data) => api.post('/auth/login', data);

// Get current user (needs token). Returns { user }
export const getMe = () => api.get('/auth/me');