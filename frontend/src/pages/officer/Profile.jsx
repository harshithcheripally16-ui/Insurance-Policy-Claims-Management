import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, Alert, Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import officerService from '../../services/officerService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', phone: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await officerService.getProfile();
      setProfile(data);
      setFormData({ full_name: data.full_name || '', phone: data.phone || '', password: '' });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updateData = { full_name: formData.full_name, phone: formData.phone };
      if (formData.password && formData.password.length >= 6) updateData.password = formData.password;
      const updated = await officerService.updateProfile(updateData);
      setProfile(updated);
      setFormData(prev => ({ ...prev, password: '' }));
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading profile..." />;
  if (error && !profile) return <ErrorMessage message={error} onRetry={fetchProfile} />;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>My Profile</Typography>
        <Typography variant="body2" color="text.secondary">Manage your account information.</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, border: '2px solid #ccfbf1' }}>
              <PersonIcon sx={{ fontSize: 40, color: '#0f766e' }} />
            </Box>
            <Typography variant="h6" fontWeight="700">{profile?.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Box><Typography variant="h6" fontWeight="700" color="secondary.main">{profile?.reviews_count}</Typography><Typography variant="caption" color="text.secondary">Reviews</Typography></Box>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Edit Profile</Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Email" value={profile?.email || ''} disabled helperText="Email cannot be changed" /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="New Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} helperText="Leave blank to keep current password (min 6 characters)" /></Grid>
                <Grid item xs={12} sx={{ textAlign: 'right' }}><Button type="submit" variant="contained" color="secondary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button></Grid>
              </Grid>
            </form>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
