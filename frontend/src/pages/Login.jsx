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
import authService from '../services/authService';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import KeyIcon from '@mui/icons-material/Key';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

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

  // Forgot Password / OTP State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Request OTP, 2: Verify & Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleOpenForgot = () => {
    setForgotEmail(email || '');
    setForgotStep(1);
    setForgotOtp('');
    setForgotNewPass('');
    setForgotConfirmPass('');
    setForgotError('');
    setForgotSuccess('');
    setForgotOpen(true);
  };

  const handleSendForgotOtp = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      await authService.sendOtp(forgotEmail.trim(), 'FORGOT_PASSWORD');
      setForgotSuccess(`A 6-digit verification code has been dispatched to ${forgotEmail.trim()}`);
      setForgotStep(2);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to send OTP email. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (forgotOtp.trim().length !== 6) {
      setForgotError('Verification code must be exactly 6 digits.');
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.resetPassword(forgotEmail.trim(), forgotOtp.trim(), forgotNewPass);
      setForgotSuccess('Your password has been successfully reset! You can now sign in.');
      setEmail(forgotEmail.trim());
      setPassword('');
      setTimeout(() => {
        setForgotOpen(false);
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

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

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" fontWeight="700" color="text.secondary">
                  PASSWORD
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleOpenForgot}
                  sx={{
                    p: 0,
                    minWidth: 0,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#ff5a00',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>
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
                mt: 2,
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

      {/* Forgot Password & Live SMTP OTP Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={() => !forgotLoading && setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#002970', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ bgcolor: '#fff5f0', p: 1, borderRadius: '50%', color: '#ff5a00', display: 'flex' }}>
            <KeyIcon />
          </Box>
          Reset Account Password
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          {forgotError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {forgotError}
            </Alert>
          )}

          {forgotSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {forgotSuccess}
            </Alert>
          )}

          {forgotStep === 1 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter your account email address. We will send a secure <strong>6-digit verification code (OTP)</strong> via live SMTP to verify your identity.
              </Typography>
              <TextField
                fullWidth
                label="Registered Email Address"
                placeholder="e.g. admin@insurance.com"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" sx={{ color: '#ff5a00' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ bgcolor: '#f0fdf9', p: 1.5, borderRadius: 2, border: '1px solid #00a896' }}>
                <Typography variant="caption" color="#004d40" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MarkEmailReadIcon fontSize="small" /> CODE DISPATCHED
                </Typography>
                <Typography variant="body2" color="#004d40" sx={{ mt: 0.5 }}>
                  Please enter the 6-digit OTP code sent to <strong>{forgotEmail}</strong>
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="6-Digit Verification Code (OTP)"
                placeholder="123456"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={forgotLoading}
                autoFocus
                inputProps={{ style: { fontSize: '1.25rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 } }}
              />

              <TextField
                fullWidth
                label="New Password"
                placeholder="Enter new strong password"
                type="password"
                value={forgotNewPass}
                onChange={(e) => setForgotNewPass(e.target.value)}
                disabled={forgotLoading}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                placeholder="Re-enter new password"
                type="password"
                value={forgotConfirmPass}
                onChange={(e) => setForgotConfirmPass(e.target.value)}
                disabled={forgotLoading}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Didn't receive code?"}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  disabled={countdown > 0 || forgotLoading}
                  onClick={handleSendForgotOtp}
                  sx={{ textTransform: 'none', fontWeight: 700, color: '#ff5a00' }}
                >
                  Resend OTP
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setForgotOpen(false)}
            disabled={forgotLoading}
            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>

          {forgotStep === 1 ? (
            <Button
              variant="contained"
              onClick={handleSendForgotOtp}
              disabled={forgotLoading || !forgotEmail.trim()}
              sx={{
                bgcolor: '#ff5a00',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#e04f00' }
              }}
            >
              {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP Code'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleResetPassword}
              disabled={forgotLoading || !forgotOtp.trim() || !forgotNewPass}
              sx={{
                bgcolor: '#002970',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#001848' }
              }}
            >
              {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;

