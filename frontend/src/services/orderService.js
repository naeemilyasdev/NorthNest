import apiClient from './apiService.js';

export const orderService = {
  createOrder: async (orderData) => {
    const { data } = await apiClient.post('/orders', orderData);
    return data;
  },

  getOrders: async () => {
    const { data } = await apiClient.get('/orders');
    return data;
  },

  getOrderById: async (id) => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (id, status) => {
    const { data } = await apiClient.patch(`/orders/${id}/status`, {
      orderStatus: status,
    });
    return data;
  },

  cancelOrder: async (id) => {
    const { data } = await apiClient.post(`/orders/${id}/cancel`);
    return data;
  },

  deleteOrder: async (id) => {
    const { data } = await apiClient.delete(`/orders/${id}`);
    return data;
  },
};
