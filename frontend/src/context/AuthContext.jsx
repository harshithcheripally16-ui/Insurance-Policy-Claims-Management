import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const res = await api.post('/auth/login-json', { email, password });
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          // If previous session was non-Customer (e.g. Officer/Admin), force customer login for Customer testing
          if (res.data.role !== 'CUSTOMER') {
            await login('customer@insure.com', 'password123');
          } else {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          try {
            await login('customer@insure.com', 'password123');
          } catch (e) {
            logout();
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Auto log in as Customer if no token exists
        try {
          await login('customer@insure.com', 'password123');
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
