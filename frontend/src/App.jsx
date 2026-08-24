import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import theme from './theme';
import { AuthContext, AuthProvider } from './context/AuthContext';

import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InsurancePlansPage from './pages/InsurancePlansPage';
import PoliciesPage from './pages/PoliciesPage';
import UsersPage from './pages/UsersPage';

// Protected Layout component wrapping Navbar & Sidebar inside ErrorBoundary
const ProtectedLayout = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#edf5ff' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/policies/catalog" element={<InsurancePlansPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
