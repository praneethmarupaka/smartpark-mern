import api from './axios.js';

export const ownerApi = {
  getDashboard: () => api.get('/owner/dashboard'),
  getMyParking: () => api.get('/owner/parking'),
  updateAvailability: (id, data) => api.patch(`/owner/parking/${id}/availability`, data),
  getBookings: (params) => api.get('/owner/bookings', { params }),
  validateQr: (tokenOrRef) => api.post('/owner/validate-qr', { tokenOrRef }),
  checkoutQr: (tokenOrRef) => api.post('/owner/checkout-qr', { tokenOrRef }),
  getAnalytics: () => api.get('/owner/analytics')
};
