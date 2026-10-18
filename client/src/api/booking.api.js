import api from './axios.js';

export const bookingApi = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  checkIn: (id, tokenOrRef) => api.post(`/bookings/${id}/check-in`, { tokenOrRef }),
  checkOut: (id, tokenOrRef) => api.post(`/bookings/${id}/check-out`, { tokenOrRef })
};
