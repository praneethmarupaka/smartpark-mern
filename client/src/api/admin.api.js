import api from './axios.js';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPending: (params) => api.get('/admin/parking/pending', { params }),
  updateVerification: (id, data) => api.patch(`/admin/parking/${id}/verification`, data),
  updateStatus: (id, data) => api.patch(`/admin/parking/${id}/status`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  previewImport: (data) => api.post('/admin/import/preview', data),
  commitImport: (data) => api.post('/admin/import/commit', data),
  getImports: () => api.get('/admin/imports'),
  getCoverage: () => api.get('/admin/coverage'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`)
};
