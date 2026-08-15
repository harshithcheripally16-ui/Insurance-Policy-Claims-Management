import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, Alert,
  Stepper, Step, StepLabel, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    otp_code: '',
    phone: '',
    address: ''
  });

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [demoOTP, setDemoOTP] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // STEP 1: Request OTP via SMTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!formData.full_name || !formData.email || !formData.password) {
      setMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', {
        email: formData.email,
        purpose: 'REGISTRATION'
      });

      if (res.data.otp_code_demo) {
        setDemoOTP(res.data.otp_code_demo);
      }

      setMsg({ type: 'success', text: `6-Digit Verification Code sent to ${formData.email}!` });
      setActiveStep(1);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to send OTP verification email.' });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!formData.otp_code || formData.otp_code.length !== 6) {
      setMsg({ type: 'error', text: 'Please enter a valid 6-digit OTP code.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register-with-otp', formData);
      setMsg({ type: 'success', text: 'Registration successful! Signing in...' });
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Invalid or expired OTP code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
          Agent Account Registration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign up with Email Verification
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          <Step><StepLabel>Customer Details</StepLabel></Step>
          <Step><StepLabel>Email Verification</StepLabel></Step>
        </Stepper>

        {msg.text && (
          <Alert severity={msg.type || 'info'} sx={{ mb: 2, borderRadius: 2 }}>
            {msg.text}
          </Alert>
        )}

        {/* STEP 1: Enter Profile & Send OTP */}
        {activeStep === 0 && (
          <Box component="form" onSubmit={handleRequestOTP}>
            <TextField
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="dense"
              placeholder="+91 98765 43210"
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              margin="dense"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 700 }}
            >
              {loading ? 'Sending Code...' : 'Send Verification Code (OTP)'}
            </Button>
          </Box>
        )}

        {/* STEP 2: Enter 6-Digit OTP & Register */}
        {activeStep === 1 && (
          <Box component="form" onSubmit={handleVerifyAndRegister}>
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2, textAlign: 'center' }}>
              <MarkEmailReadIcon sx={{ color: 'primary.main', fontSize: 36, mb: 0.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Verification Email Sent
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                We sent a 6-digit OTP code via SMTP to <strong>{formData.email}</strong>.
              </Typography>

              {demoOTP && (
                <Alert severity="info" sx={{ mt: 1.5, py: 0.5, px: 1, fontSize: '0.78rem' }}>
                  <strong>Demo Testing OTP Code:</strong> {demoOTP}
                </Alert>
              )}
            </Box>

            <TextField
              fullWidth
              label="Enter 6-Digit OTP Code"
              name="otp_code"
              value={formData.otp_code}
              onChange={handleChange}
              margin="normal"
              placeholder="e.g. 123456"
              required
              inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontWeight: 800, fontSize: '1.2rem', textAlign: 'center' } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><KeyIcon color="primary" /></InputAdornment>
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              color="success"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
              sx={{ mt: 2.5, mb: 1.5, py: 1.2, fontWeight: 700 }}
            >
              {loading ? 'Verifying...' : 'Verify Code & Complete Registration'}
            </Button>

            <Button
              fullWidth
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveStep(0)}
              disabled={loading}
            >
              Back to Change Details
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
