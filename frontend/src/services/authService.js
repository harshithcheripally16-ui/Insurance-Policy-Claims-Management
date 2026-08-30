import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  sendOtp: async (email, purpose = 'FORGOT_PASSWORD') => {
    const response = await api.post('/auth/send-otp', { email, purpose });
    return response.data;
  },

  verifyOtp: async (email, otp, purpose = 'FORGOT_PASSWORD') => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  },
};

export default authService;
