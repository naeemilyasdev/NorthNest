import apiClient from './apiService.js';

export const contactService = {
  sendMessage: async (contactData) => {
    const { data } = await apiClient.post('/contact', contactData);
    return data;
  },
};
