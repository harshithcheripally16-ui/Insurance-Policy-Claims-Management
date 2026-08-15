import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  TextField, Button, Alert, Avatar, Divider, CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import api from '../services/api';

export default function ProfileDialog({ open, onClose, user, onProfileUpdated }) {
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name?.replace(/\s*\([^)]*\)/, '') || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setMsg({ type: '', text: '' });
    }
  }, [user, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.put('/users/me', formData);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      if (onProfileUpdated) onProfileUpdated(res.data);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#1e3a8a', width: 38, height: 38, fontWeight: 700 }}>
          {user.full_name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Customer Profile
          </Typography>
          <Typography variant="caption" color="text.secondary">
            View & Edit Your Personal Details
          </Typography>
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {msg.text && (
            <Alert severity={msg.type || 'info'} sx={{ mb: 2, borderRadius: 2 }}>
              {msg.text}
            </Alert>
          )}

          {/* Email (Read Only) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <EmailIcon sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Registered Email (Read Only)</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.email}</Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            margin="normal"
            required
            InputProps={{
              startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
            placeholder="+91 98765 43210"
            InputProps={{
              startAdornment: <PhoneIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Residential Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            margin="normal"
            placeholder="House Number, Street, City, State, Pincode"
            InputProps={{
              startAdornment: <HomeIcon sx={{ color: 'text.secondary', mr: 1, mt: 1 }} />
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
