import apiClient from './apiService.js';

export const settingsService = {
  getStoreSettings: async () => {
    const { data } = await apiClient.get('/settings');
    return data.data;
  },

  getAdminStoreSettings: async () => {
    const { data } = await apiClient.get('/settings/admin');
    return data.data;
  },

  updateAdminStoreSettings: async (settings) => {
    const { data } = await apiClient.put('/settings/admin', settings);
    return data.data;
  },
};
