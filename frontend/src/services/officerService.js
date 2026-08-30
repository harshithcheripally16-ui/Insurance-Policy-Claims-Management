import api from './api';

export const officerService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/officer/dashboard');
    return response.data;
  },

  // Claims
  getClaims: async (params = {}) => {
    const response = await api.get('/officer/claims', { params });
    return response.data;
  },

  getClaimDetails: async (id) => {
    const response = await api.get(`/officer/claims/${id}`);
    return response.data;
  },

  // Reviews
  submitReview: async (claimId, reviewData) => {
    const response = await api.post(`/officer/claims/${claimId}/review`, reviewData);
    return response.data;
  },

  getMyReviews: async (params = {}) => {
    const response = await api.get('/officer/reviews', { params });
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/officer/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/officer/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await api.patch('/officer/notifications/read-all');
    return response.data;
  },

  // Profile
  getProfile: async () => {
    const response = await api.get('/officer/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/officer/profile', data);
    return response.data;
  },
};

export default officerService;
