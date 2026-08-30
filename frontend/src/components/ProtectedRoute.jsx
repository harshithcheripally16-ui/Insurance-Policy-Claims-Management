import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import LockPersonIcon from '@mui/icons-material/LockPerson';

const ProtectedRoute = ({ children, allowedRoles = ['ADMIN'] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <CircularProgress size={48} thickness={4} color="primary" />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
          Authenticating secure session...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    let targetDashboard = '/customer/dashboard';
    if (user.role === 'ADMIN') targetDashboard = '/admin/dashboard';
    else if (user.role === 'CLAIMS_OFFICER') targetDashboard = '/officer/dashboard';
    else if (user.role === 'AGENT') targetDashboard = '/agent/dashboard';
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
          textAlign: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <LockPersonIcon sx={{ fontSize: 36, color: '#ef4444' }} />
        </Box>
        <Typography variant="h4" color="error.main" gutterBottom fontWeight="800">
          403 - Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mb: 3 }}>
          Your current account role (<strong>{user.role}</strong>) does not have permission to access this module.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to={targetDashboard}
          sx={{ textTransform: 'none', px: 3, py: 1, borderRadius: 2 }}
        >
          Go to Your Portal Dashboard
        </Button>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
