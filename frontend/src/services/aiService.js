import apiClient from './apiService.js';

export const aiService = {
  getRecommendations: async (preferences) => {
    const { data } = await apiClient.post('/ai/recommendations', {
      preferences,
    });
    return data;
  },

  getHealthAdvice: async (query) => {
    const { data } = await apiClient.post('/ai/advice', { query });
    return data;
  },
};
