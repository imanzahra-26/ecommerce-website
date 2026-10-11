// Cart-related API calls (all need token)
import api from './axios';

export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);       // { product_id, quantity }
export const updateCartItem = (id, data) => api.put(`/cart/${id}`, data); // { quantity }
export const removeCartItem = (id) => api.delete(`/cart/${id}`);