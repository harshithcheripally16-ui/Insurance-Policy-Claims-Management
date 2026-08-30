import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Divider,
  Avatar,
  TextField,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockResetIcon from '@mui/icons-material/LockReset';
import SecurityIcon from '@mui/icons-material/Security';

import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const Profile = () => {
  const { user } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setToast({ open: true, message: 'Password must be at least 6 characters.', severity: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ open: true, message: 'New password and confirmation do not match.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      await adminService.updateUser(user.id, { password: passwordForm.newPassword });
      setToast({ open: true, message: 'Administrator password updated successfully.', severity: 'success' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password update failed:', err);
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to update password.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          Administrator Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Account credentials, RBAC security privileges, and session management.
        </Typography>
      </Box>

      {/* Profile Overview Card */}
      <Card sx={{ mb: 3.5 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              {user?.full_name?.charAt(0) || 'A'}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h5" fontWeight="800">
                  {user?.full_name || 'System Administrator'}
                </Typography>
                <Chip
                  icon={<AdminPanelSettingsIcon />}
                  label="SUPER ADMIN"
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'admin@insurance.com'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Account Active • Full System Level Privileges
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Security & Roles */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<SecurityIcon color="primary" />}
              title={<Typography variant="subtitle1" fontWeight="700">Security Privileges & Scopes</Typography>}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">AUTHORIZATION LEVEL</Typography>
                  <Typography variant="body2" fontWeight="600">ROLE_ADMIN (Unrestricted System Management)</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">ASSIGNED MODULES</Typography>
                  <Typography variant="body2">Admin Dashboard, User Administration, Policy Operations, Claims & Compliance Monitoring</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">SECURITY PROTOCOL</Typography>
                  <Typography variant="body2">PyJWT Bearer Authentication • Bcrypt Hash (256-bit salt)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<LockResetIcon color="warning" />}
              title={<Typography variant="subtitle1" fontWeight="700">Update Credentials</Typography>}
            />
            <Divider />
            <CardContent>
              <form onSubmit={handleUpdatePassword}>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="New Password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </Box>
                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </Box>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Update Admin Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
