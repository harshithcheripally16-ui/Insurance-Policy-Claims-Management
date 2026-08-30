import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useAuth } from '../context/AuthContext';

const PRESET_CREDENTIALS = [
  { role: 'Admin', email: 'admin@insurance.com', pass: 'Admin@123', icon: <AdminPanelSettingsIcon fontSize="small" /> },
  { role: 'Customer', email: 'customer@insurance.com', pass: 'Customer@123', icon: <PersonIcon fontSize="small" /> },
  { role: 'Claims Officer', email: 'officer@insurance.com', pass: 'Officer@123', icon: <FactCheckIcon fontSize="small" /> },
  { role: 'Agent', email: 'agent@insurance.com', pass: 'Agent@123', icon: <SupportAgentIcon fontSize="small" /> },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPreset = (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      const fromPath = location.state?.from?.pathname;
      if (loggedUser.role === 'ADMIN') {
        const target = (fromPath && fromPath.startsWith('/admin')) ? fromPath : '/admin/dashboard';
        navigate(target, { replace: true });
      } else if (loggedUser.role === 'CUSTOMER') {
        const target = (fromPath && fromPath.startsWith('/customer')) ? fromPath : '/customer/dashboard';
        navigate(target, { replace: true });
      } else if (loggedUser.role === 'CLAIMS_OFFICER') {
        const target = (fromPath && fromPath.startsWith('/officer')) ? fromPath : '/officer/dashboard';
        navigate(target, { replace: true });
      } else if (loggedUser.role === 'AGENT') {
        const target = (fromPath && fromPath.startsWith('/agent')) ? fromPath : '/agent/dashboard';
        navigate(target, { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to sign in. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #002970 0%, #001848 100%)',
        p: 2.5,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 3.5,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          {/* Brand Header */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#ff5a00',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                boxShadow: '0 4px 14px rgba(255, 90, 0, 0.4)',
              }}
            >
              <SecurityIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#002970', letterSpacing: '-0.5px' }}>
              Insurcare<span style={{ color: '#ff5a00' }}>.pro</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Insurance Policy & Claims Management System
            </Typography>
          </Box>

          {/* Quick Demo Login Presets */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: 0.5 }}>
              DEMO QUICK LOGIN PRESETS
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {PRESET_CREDENTIALS.map((item) => (
                <Chip
                  key={item.role}
                  icon={item.icon}
                  label={item.role}
                  size="small"
                  onClick={() => handleSelectPreset(item.email, item.pass)}
                  sx={{
                    bgcolor: email === item.email ? '#002970' : '#ffffff',
                    color: email === item.email ? '#ffffff' : '#334155',
                    borderColor: '#cbd5e1',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '& .MuiChip-icon': {
                      color: email === item.email ? '#ff5a00' : '#64748b'
                    },
                    '&:hover': {
                      bgcolor: '#ff5a00',
                      color: '#ffffff',
                      '& .MuiChip-icon': { color: '#ffffff' }
                    }
                  }}
                  variant={email === item.email ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                EMAIL ADDRESS
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" sx={{ color: '#ff5a00' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                PASSWORD
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" sx={{ color: '#ff5a00' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.4,
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: 2.5,
                textTransform: 'none',
                bgcolor: '#ff5a00',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(255, 90, 0, 0.4)',
                '&:hover': {
                  bgcolor: '#e04f00',
                  boxShadow: '0 6px 18px rgba(255, 90, 0, 0.5)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          {/* Customer Registration Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              New policyholder?{' '}
              <Link to="/register" style={{ color: '#ff5a00', textDecoration: 'none', fontWeight: 700 }}>
                Register for an Account
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
