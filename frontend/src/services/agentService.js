import api from './api';

export const agentService = {
  getDashboard: async () => {
    const response = await api.get('/agent/dashboard');
    return response.data;
  },
  getCustomers: async (params = {}) => {
    const response = await api.get('/agent/customers', { params });
    return response.data;
  },
  getCustomerDetail: async (id) => {
    const response = await api.get(`/agent/customers/${id}`);
    return response.data;
  },
  getPurchases: async (params = {}) => {
    const response = await api.get('/agent/purchases', { params });
    return response.data;
  },
  getPurchaseDetail: async (id) => {
    const response = await api.get(`/agent/purchases/${id}`);
    return response.data;
  },
  getClaims: async (params = {}) => {
    const response = await api.get('/agent/claims', { params });
    return response.data;
  },
  getClaimDetail: async (id) => {
    const response = await api.get(`/agent/claims/${id}`);
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get('/agent/notifications');
    return response.data;
  },
  markNotificationRead: async (id) => {
    const response = await api.patch(`/agent/notifications/${id}/read`);
    return response.data;
  },
  markAllNotificationsRead: async () => {
    const response = await api.patch('/agent/notifications/read-all');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/agent/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/agent/profile', data);
    return response.data;
  },
};

export default agentService;
