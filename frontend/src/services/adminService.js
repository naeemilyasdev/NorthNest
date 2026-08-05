import apiClient from './apiService.js';

export const adminService = {
  getOverview: async () => {
    const { data } = await apiClient.get('/admin/overview');
    return data.data;
  },

  getCustomers: async () => {
    const { data } = await apiClient.get('/admin/customers');
    return data.data;
  },
};
