// Order-related API calls (all need token)
import api from './axios';

export const checkout = () => api.post('/orders');                 // no body — reads cart
export const getMyOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);