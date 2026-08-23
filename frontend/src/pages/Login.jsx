import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';

import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('agent@insure.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password OTP modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleSendOTP = async () => {
    if (!forgotEmail) {
      setForgotMsg({ type: 'error', text: 'Please enter your registered email' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/send-otp', { email: forgotEmail, purpose: 'FORGOT_PASSWORD' });
      setForgotMsg({ type: 'success', text: `OTP sent! (Demo Code: ${res.data.demo_otp})` });
      setActiveStep(1);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to send OTP' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      setForgotMsg({ type: 'error', text: 'Please enter 6-digit OTP code' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });
    try {
      await api.post('/auth/verify-otp', { email: forgotEmail, otp: otpCode, purpose: 'FORGOT_PASSWORD' });
      setForgotMsg({ type: 'success', text: 'OTP Verified! Enter your new password.' });
      setActiveStep(2);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.detail || 'Invalid OTP code' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setForgotMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: otpCode,
        new_password: newPassword
      });
      setForgotMsg({ type: 'success', text: 'Password reset successful! You can now log in.' });
      setTimeout(() => {
        setForgotOpen(false);
        setActiveStep(0);
        setPassword(newPassword);
      }, 1500);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to reset password' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #edf5ff 45%, #e1effc 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 3, boxShadow: '0 12px 40px rgba(0, 41, 112, 0.12)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff5a00 0%, #d94b00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                margin: '0 auto',
                mb: 1.5,
                boxShadow: '0 4px 14px rgba(255,90,0,0.3)',
              }}
            >
              <SecurityIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#002970' }}>
              insurcare<span style={{ color: '#ff5a00' }}>.pro</span>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Insurance Agent & Client Portal Sign-In
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: '#002970' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#002970' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#00a896', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setEmail('agent@insure.com')}
                >
                  Use Agent Demo Credentials
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#ff5a00', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => setForgotOpen(true)}
                >
                  Forgot Password?
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.4, fontSize: '1rem', fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Agent Portal'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#ff5a00', fontWeight: 700, textDecoration: 'none' }}>
                Create Account
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Forgot Password OTP Modal */}
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#002970' }}>Reset Password with Email OTP</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            <Step><StepLabel>Email</StepLabel></Step>
            <Step><StepLabel>OTP</StepLabel></Step>
            <Step><StepLabel>New Password</StepLabel></Step>
          </Stepper>

          {forgotMsg.text && (
            <Alert severity={forgotMsg.type || 'info'} sx={{ mb: 2 }}>
              {forgotMsg.text}
            </Alert>
          )}

          {activeStep === 0 && (
            <TextField
              label="Registered Email Address"
              fullWidth
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="agent@insure.com"
            />
          )}

          {activeStep === 1 && (
            <TextField
              label="Enter 6-Digit OTP Code"
              fullWidth
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
            />
          )}

          {activeStep === 2 && (
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setForgotOpen(false)} color="inherit">Cancel</Button>
          {activeStep === 0 && (
            <Button onClick={handleSendOTP} variant="contained" color="secondary" disabled={forgotLoading}>
              Send Verification Code
            </Button>
          )}
          {activeStep === 1 && (
            <Button onClick={handleVerifyOTP} variant="contained" color="secondary" disabled={forgotLoading}>
              Verify Code
            </Button>
          )}
          {activeStep === 2 && (
            <Button onClick={handleResetPassword} variant="contained" color="secondary" disabled={forgotLoading}>
              Update Password
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
