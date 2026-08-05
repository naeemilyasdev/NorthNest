import apiClient from './apiService.js';

export const authService = {
  register: async (userData) => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  login: async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  updateProfile: async (userData) => {
    const { data } = await apiClient.put('/auth/profile', userData);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
