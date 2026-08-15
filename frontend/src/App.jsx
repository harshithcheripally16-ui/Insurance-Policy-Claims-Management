import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import { useAuth, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PoliciesPage from './pages/PoliciesPage';
import InsurancePlansPage from './pages/InsurancePlansPage';
import ClaimsPage from './pages/ClaimsPage';
import UsersPage from './pages/UsersPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <Navbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Box sx={{ display: 'flex', flexGrow: 1, overflowX: 'hidden' }}>
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 }, mb: 4, flexGrow: 1, px: { xs: 1.5, sm: 3 } }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/policies/catalog" element={<InsurancePlansPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
