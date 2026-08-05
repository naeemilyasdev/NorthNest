import apiClient from './apiService.js';

export const productService = {
  getAllProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await apiClient.get(`/products?${params}`);
    return data;
  },

  getProductById: async (id) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await apiClient.post('/products', productData);
    return data;
  },

  updateProduct: async (id, productData) => {
    const { data } = await apiClient.put(`/products/${id}`, productData);
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  },

  addReview: async (id, reviewData) => {
    const { data } = await apiClient.post(`/products/${id}/reviews`, reviewData);
    return data;
  },
};
