import apiClient from './apiService.js';

export const cartService = {
  getCart: async () => {
    const { data } = await apiClient.get('/cart');
    return data;
  },

  addToCart: async (cartItem) => {
    const { data } = await apiClient.post('/cart/add', cartItem);
    return data;
  },

  updateCartItem: async (cartItem) => {
    const { data } = await apiClient.put('/cart/update', cartItem);
    return data;
  },

  removeFromCart: async (productId) => {
    const { data } = await apiClient.post('/cart/remove', { productId });
    return data;
  },

  clearCart: async () => {
    const { data } = await apiClient.delete('/cart/clear');
    return data;
  },
};
