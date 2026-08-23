import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  });

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStartRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send OTP to email first
      const res = await api.post('/auth/send-otp', {
        email: formData.email,
        purpose: 'REGISTER'
      });

      setDemoOtp(res.data.demo_otp);
      setOtpModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to dispatch verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = async () => {
    if (!otpCode) {
      setError('Please enter OTP code');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        ...formData,
        otp: otpCode
      });

      setMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
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
        background: 'linear-gradient(180deg, #ffffff 0%, #edf5ff 45%, #e1effc 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%', borderRadius: 3, boxShadow: '0 12px 40px rgba(0, 41, 112, 0.12)' }}>
        <CardContent sx={{ p: 4 }}>
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
              }}
            >
              <SecurityIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#002970' }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Join InsurCare Insurance Network
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

          <form onSubmit={handleStartRegister}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />

              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Account Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Account Role"
                  onChange={handleChange}
                >
                  <MenuItem value="CUSTOMER">Client Account (Customer)</MenuItem>
                  <MenuItem value="AGENT">Insurance Agent</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification OTP'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Already registered?{' '}
              <Link to="/login" style={{ color: '#ff5a00', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#002970' }}>Email Verification OTP</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            A 6-digit security code was dispatched to <strong>{formData.email}</strong>.
          </Typography>

          {demoOtp && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Demo OTP Code: <strong>{demoOtp}</strong>
            </Alert>
          )}

          <TextField
            label="6-Digit Verification Code"
            fullWidth
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOtpModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCompleteRegister} variant="contained" color="secondary" disabled={loading}>
            Verify & Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;
