import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, Alert
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('customer@insure.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: '#eff6ff', borderRadius: '50%', mb: 1 }}>
          <ShieldIcon sx={{ fontSize: 40, color: '#1e3a8a' }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a' }}>
          Customer Portal Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Insurance Policy & Claims Management System
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
          <TextField
            fullWidth
            label="Email Address"
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<LockOpenIcon />}
            sx={{ mt: 2.5, mb: 2, bgcolor: '#1e3a8a', py: 1.2 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have a Customer account?{' '}
            <Link to="/register" style={{ color: '#1e3a8a', fontWeight: 600, textDecoration: 'none' }}>
              Register Here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
