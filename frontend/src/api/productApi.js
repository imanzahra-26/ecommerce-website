// Product-related API calls
import api from './axios';

// List products. Optional filters: { category, search }
export const getProducts = (params = {}) => api.get('/products', { params });

// Get single product by id
export const getProductById = (id) => api.get(`/products/${id}`);