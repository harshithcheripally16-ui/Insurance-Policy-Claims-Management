import api from './api';

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, { is_active: isActive });
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Customers (Administrative view)
  getCustomers: async (params = {}) => {
    const response = await api.get('/admin/customers', { params });
    return response.data;
  },
  getCustomer: async (id) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  // Agents
  getAgents: async (params = {}) => {
    const response = await api.get('/admin/agents', { params });
    return response.data;
  },
  getAgent: async (id) => {
    const response = await api.get(`/admin/agents/${id}`);
    return response.data;
  },
  createAgent: async (agentData) => {
    const response = await api.post('/admin/agents', agentData);
    return response.data;
  },
  updateAgent: async (id, agentData) => {
    const response = await api.put(`/admin/agents/${id}`, agentData);
    return response.data;
  },
  updateAgentStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/agents/${id}/status`, { is_active: isActive });
    return response.data;
  },
  deleteAgent: async (id) => {
    const response = await api.delete(`/admin/agents/${id}`);
    return response.data;
  },

  // Claims Officers
  getClaimsOfficers: async (params = {}) => {
    const response = await api.get('/admin/claims-officers', { params });
    return response.data;
  },
  getClaimsOfficer: async (id) => {
    const response = await api.get(`/admin/claims-officers/${id}`);
    return response.data;
  },
  createClaimsOfficer: async (officerData) => {
    const response = await api.post('/admin/claims-officers', officerData);
    return response.data;
  },
  updateClaimsOfficer: async (id, officerData) => {
    const response = await api.put(`/admin/claims-officers/${id}`, officerData);
    return response.data;
  },
  updateClaimsOfficerStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/claims-officers/${id}/status`, { is_active: isActive });
    return response.data;
  },
  deleteClaimsOfficer: async (id) => {
    const response = await api.delete(`/admin/claims-officers/${id}`);
    return response.data;
  },

  // Policies
  getPolicies: async (params = {}) => {
    const response = await api.get('/admin/policies', { params });
    return response.data;
  },
  getPolicy: async (id) => {
    const response = await api.get(`/admin/policies/${id}`);
    return response.data;
  },
  createPolicy: async (policyData) => {
    const response = await api.post('/admin/policies', policyData);
    return response.data;
  },
  updatePolicy: async (id, policyData) => {
    const response = await api.put(`/admin/policies/${id}`, policyData);
    return response.data;
  },
  updatePolicyStatus: async (id, status) => {
    const response = await api.patch(`/admin/policies/${id}/status`, { status });
    return response.data;
  },
  deletePolicy: async (id) => {
    const response = await api.delete(`/admin/policies/${id}`);
    return response.data;
  },

  // Policy Purchases
  getPolicyPurchases: async (params = {}) => {
    const response = await api.get('/admin/policy-purchases', { params });
    return response.data;
  },
  getPolicyPurchase: async (id) => {
    const response = await api.get(`/admin/policy-purchases/${id}`);
    return response.data;
  },

  // Claims Monitoring
  getClaims: async (params = {}) => {
    const response = await api.get('/admin/claims', { params });
    return response.data;
  },
  getClaim: async (id) => {
    const response = await api.get(`/admin/claims/${id}`);
    return response.data;
  },

  // Documents
  getDocuments: async (params = {}) => {
    const response = await api.get('/admin/documents', { params });
    return response.data;
  },
  getDocument: async (id) => {
    const response = await api.get(`/admin/documents/${id}`);
    return response.data;
  },
  getDocumentFileBlob: async (id) => {
    const response = await api.get(`/admin/documents/${id}/file`, { responseType: 'blob' });
    return response;
  },

  // Reports
  getClaimReports: async () => {
    const response = await api.get('/admin/reports/claims');
    return response.data;
  },
  getPolicyReports: async () => {
    const response = await api.get('/admin/reports/policies');
    return response.data;
  },
  getPremiumReports: async () => {
    const response = await api.get('/admin/reports/premium');
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  }
};

export default adminService;
