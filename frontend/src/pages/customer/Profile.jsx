import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import SaveIcon from '@mui/icons-material/Save';

import customerService from '../../services/customerService';
import Loading from '../../components/Loading';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await customerService.getProfile();
      setProfile(res);
      setFullName(res.full_name || '');
      setPhone(res.phone || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (password) {
      if (password.length < 6) {
        setToast({ open: true, message: 'Password must be at least 6 characters long.', severity: 'error' });
        return;
      }
      if (password !== confirmPassword) {
        setToast({ open: true, message: 'Passwords do not match.', severity: 'error' });
        return;
      }
    }

    setSaving(true);
    try {
      const updateData = {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        password: password ? password : undefined,
      };
      const updated = await customerService.updateProfile(updateData);
      setProfile(updated);
      setPassword('');
      setConfirmPassword('');
      setToast({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      console.error('Profile update failed:', err);
      setToast({ open: true, message: err.response?.data?.detail || 'Failed to update profile.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading profile information..." />;

  return (
    <Box sx={{ pb: 4, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          Policyholder Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your personal contact details, account credentials, and policyholder verification status.
        </Typography>
      </Box>

      {/* Profile Card */}
      <Card sx={{ borderRadius: 3.5, mb: 3.5, boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{
                width: 76,
                height: 76,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              {profile?.full_name?.charAt(0) || 'C'}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h5" fontWeight="800">
                  {profile?.full_name}
                </Typography>
                <Chip label="POLICYHOLDER" color="primary" size="small" sx={{ fontWeight: 700 }} />
                <Chip label="Active Account" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {profile?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Member since {new Date(profile?.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card sx={{ borderRadius: 3.5, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight="800">
            Edit Personal Details & Credentials
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <form onSubmit={handleUpdateProfile}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={profile?.email || ''}
                  disabled
                  helperText="Email is bound to your policyholder identity"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Role"
                  value="CUSTOMER"
                  disabled
                  helperText="Role permissions are managed centrally"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>
                  Change Account Password (Optional)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Leave blank if you do not wish to update your password.
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={saving}
                  startIcon={<SaveIcon />}
                  sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

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
