import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  InputAdornment, CircularProgress
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockResetIcon from '@mui/icons-material/LockReset';
import SendIcon from '@mui/icons-material/Send';
import KeyIcon from '@mui/icons-material/Key';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('agent@insure.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // FORGOT PASSWORD MODAL STATE
  const [openForgotModal, setOpenForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(0);
  const [forgotForm, setForgotForm] = useState({ email: '', otp_code: '', new_password: '' });
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [demoOTP, setDemoOTP] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Request Password Reset OTP
  const handleRequestForgotOTP = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    if (!forgotForm.email) {
      setForgotMsg({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/send-otp', {
        email: forgotForm.email,
        purpose: 'FORGOT_PASSWORD'
      });

      if (res.data.otp_code_demo) {
        setDemoOTP(res.data.otp_code_demo);
      }

      setForgotMsg({ type: 'success', text: `6-Digit Password Reset OTP sent to ${forgotForm.email}!` });
      setForgotStep(1);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.detail || 'Account email not found.' });
    } finally {
      setForgotLoading(false);
    }
  };

  // STEP 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    if (!forgotForm.otp_code || !forgotForm.new_password) {
      setForgotMsg({ type: 'error', text: 'Please fill in both OTP code and new password.' });
      return;
    }
    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password', forgotForm);
      setForgotMsg({ type: 'success', text: 'Password reset successfully! You can now sign in.' });
      setTimeout(() => {
        setEmail(forgotForm.email);
        setPassword(forgotForm.new_password);
        setOpenForgotModal(false);
        setForgotStep(0);
        setForgotForm({ email: '', otp_code: '', new_password: '' });
      }, 1500);
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.detail || 'Invalid or expired OTP code.' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: 'action.hover', borderRadius: '50%', mb: 1 }}>
          <SupportAgentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
          Insurance Agent Portal Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Insurance Agent Policy & Claims Management System
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
          <TextField
            fullWidth
            label="Agent Email Address"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, mb: 1 }}>
            <Button
              size="small"
              variant="text"
              onClick={() => { setOpenForgotModal(true); setForgotForm({ ...forgotForm, email }); }}
              sx={{ fontWeight: 600, fontSize: '0.82rem' }}
            >
              Forgot Password?
            </Button>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />}
            sx={{ mt: 1, mb: 2, py: 1.2, fontWeight: 700 }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Agent'}
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Need an Agent account?{' '}
            <Link to="/register" style={{ color: '#1e3a8a', fontWeight: 600, textDecoration: 'none' }}>
              Register Here
            </Link>
          </Typography>
        </Box>
      </Paper>

      {/* FORGOT PASSWORD MODAL */}
      <Dialog open={openForgotModal} onClose={() => setOpenForgotModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: 3, textAlign: 'center' }}>
          Reset Account Password
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={forgotStep} alternativeLabel sx={{ mb: 3 }}>
            <Step><StepLabel>Request OTP</StepLabel></Step>
            <Step><StepLabel>New Password</StepLabel></Step>
          </Stepper>

          {forgotMsg.text && (
            <Alert severity={forgotMsg.type || 'info'} sx={{ mb: 2, borderRadius: 2 }}>
              {forgotMsg.text}
            </Alert>
          )}

          {forgotStep === 0 && (
            <Box component="form" onSubmit={handleRequestForgotOTP}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your registered Agent email address below. We will send a 6-digit verification code to your email.
              </Typography>
              <TextField
                fullWidth
                label="Registered Agent Email"
                type="email"
                value={forgotForm.email}
                onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={forgotLoading}
                startIcon={forgotLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{ mt: 2, py: 1.2, fontWeight: 700 }}
              >
                {forgotLoading ? 'Sending OTP...' : 'Send Password Reset OTP'}
              </Button>
            </Box>
          )}

          {forgotStep === 1 && (
            <Box component="form" onSubmit={handleResetPassword}>
              {demoOTP && (
                <Alert severity="info" sx={{ mb: 2, py: 0.5, px: 1, fontSize: '0.78rem' }}>
                  <strong>Demo Testing OTP Code:</strong> {demoOTP}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Enter 6-Digit OTP Code"
                value={forgotForm.otp_code}
                onChange={(e) => setForgotForm({ ...forgotForm, otp_code: e.target.value })}
                margin="normal"
                required
                inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontWeight: 800, fontSize: '1.2rem', textAlign: 'center' } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><KeyIcon color="primary" /></InputAdornment>
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={forgotForm.new_password}
                onChange={(e) => setForgotForm({ ...forgotForm, new_password: e.target.value })}
                margin="normal"
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                disabled={forgotLoading}
                startIcon={forgotLoading ? <CircularProgress size={20} color="inherit" /> : <LockResetIcon />}
                sx={{ mt: 2, py: 1.2, fontWeight: 700 }}
              >
                {forgotLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={() => { setOpenForgotModal(false); setForgotStep(0); }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
