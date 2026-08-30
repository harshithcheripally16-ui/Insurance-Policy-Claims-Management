import api from './api';

export const customerService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/customer/dashboard');
    return response.data;
  },

  // Policy Catalog
  getPolicies: async (params = {}) => {
    const response = await api.get('/customer/policies', { params });
    return response.data;
  },

  getPolicyDetails: async (id) => {
    const response = await api.get(`/customer/policies/${id}`);
    return response.data;
  },

  // Policy Purchases
  purchasePolicy: async (policyId) => {
    const response = await api.post('/customer/purchases', { policy_id: policyId });
    return response.data;
  },

  getMyPurchases: async () => {
    const response = await api.get('/customer/purchases');
    return response.data;
  },

  getMyPurchaseDetails: async (id) => {
    const response = await api.get(`/customer/purchases/${id}`);
    return response.data;
  },

  // Claims
  submitClaim: async (claimData) => {
    const response = await api.post('/customer/claims', claimData);
    return response.data;
  },

  getMyClaims: async () => {
    const response = await api.get('/customer/claims');
    return response.data;
  },

  getMyClaimDetails: async (id) => {
    const response = await api.get(`/customer/claims/${id}`);
    return response.data;
  },

  // Documents
  uploadClaimDocument: async (claimId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/customer/claims/${claimId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getClaimDocuments: async (claimId) => {
    const response = await api.get(`/customer/claims/${claimId}/documents`);
    return response.data;
  },

  getAllMyDocuments: async () => {
    const response = await api.get('/customer/documents');
    return response.data;
  },

  getDocumentDownloadUrl: (id) => `/api/customer/documents/${id}/file`,

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/customer/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/customer/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await api.patch('/customer/notifications/read-all');
    return response.data;
  },

  // Profile
  getProfile: async () => {
    const response = await api.get('/customer/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/customer/profile', data);
    return response.data;
  },
};

export default customerService;
