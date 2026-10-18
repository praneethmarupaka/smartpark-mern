import api from './axios.js';

export const parkingApi = {
  getAll: (params) => api.get('/parking', { params }),
  getNearby: (params) => api.get('/parking/nearby', { params }),
  getById: (id) => api.get(`/parking/${id}`),
  create: (data) => api.post('/parking', data),
  update: (id, data) => api.patch(`/parking/${id}`, data),
  getAvailability: (id) => api.get(`/parking/${id}/availability`),
  submitReport: (id, data) => api.post(`/parking/${id}/report`, data),
  toggleFavorite: (parkingId) => api.post('/favorites/toggle', { parkingId }),
  getFavorites: () => api.get('/favorites')
};
