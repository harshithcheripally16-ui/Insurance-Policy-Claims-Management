import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box, Avatar, Menu,
  MenuItem, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, CircularProgress,
  TextField, Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logoutUser, updateUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || 'Priya Nair',
        email: user.email || 'agent@insure.com',
        phone: user.phone || '+91 98765 00001'
      });
    }
  }, [user, profileModalOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error("Failed to mark read:", e);
    }
  };

  // Instagram-style Profile Picture Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      try {
        const res = await api.put('/auth/profile-picture', { avatar_url: base64Image });
        updateUser({ avatar_url: res.data.avatar_url });
      } catch (err) {
        console.error('Failed to update profile picture:', err);
        alert('Failed to update profile picture. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Profile Details Edit Handler (Name, Email, Phone)
  const handleSaveProfileDetails = async () => {
    if (!profileForm.name || !profileForm.email) {
      setProfileMsg({ type: 'error', text: 'Name and email address are required' });
      return;
    }
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data);
      setProfileMsg({ type: 'success', text: 'Agent profile details updated successfully!' });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile details' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 41, 112, 0.08)',
          color: '#002970',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Brand section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onToggleSidebar}
              sx={{ color: '#002970' }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff5a00 0%, #d94b00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(255,90,0,0.3)',
                }}
              >
                <SecurityIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: '#002970',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Insurcare<span style={{ color: '#ff5a00' }}>.pro</span>
              </Typography>
            </Box>

            <Chip
              label="AGENT PORTAL"
              size="small"
              sx={{
                ml: 1,
                bgcolor: 'rgba(0, 168, 150, 0.1)',
                color: '#00a896',
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 22,
                display: { xs: 'none', md: 'inline-flex' }
              }}
            />
          </Box>

          {/* Right Action Icons & Agent Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={() => setNotifDrawerOpen(true)}
              sx={{ color: '#002970', bgcolor: 'rgba(0, 41, 112, 0.04)' }}
            >
              <Badge badgeContent={unreadCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                pl: 1,
                borderRadius: 6,
                bgcolor: 'rgba(0, 41, 112, 0.04)',
                '&:hover': { bgcolor: 'rgba(0, 41, 112, 0.08)' }
              }}
            >
              <Avatar
                src={user?.avatar_url || ''}
                sx={{
                  bgcolor: '#002970',
                  width: 34,
                  height: 34,
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              >
                {user?.name ? user.name[0] : 'P'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', pr: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#002970' }}>
                  {user?.name || 'Priya Nair'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#00a896', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <VerifiedUserIcon sx={{ fontSize: 11 }} /> Verified Agent
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 3, minWidth: 180, mt: 1 }
              }}
            >
              <MenuItem onClick={() => { setAnchorEl(null); setProfileModalOpen(true); setIsEditingProfile(false); setProfileMsg({ type: '', text: '' }); }}>
                <ListItemIcon><AccountCircleIcon fontSize="small" sx={{ color: '#002970' }} /></ListItemIcon>
                Agent Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logoutUser(); }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} /></ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 300, sm: 380 }, p: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#002970' }}>
            In-App Notifications
          </Typography>
          <IconButton onClick={() => setNotifDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <List sx={{ pt: 0 }}>
          {notifications.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No notifications available.
            </Typography>
          ) : (
            notifications.map((n) => (
              <React.Fragment key={n.id}>
                <ListItem
                  button
                  onClick={() => handleMarkRead(n.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: n.is_read ? 'transparent' : 'rgba(255, 90, 0, 0.05)',
                    borderLeft: n.is_read ? 'none' : '3px solid #ff5a00',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: n.is_read ? 600 : 700, color: '#002970' }}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span">
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.82rem', mt: 0.5 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Drawer>

      {/* Agent Profile Modal with Editable Name, Email, Phone & Picture */}
      <Dialog open={profileModalOpen} onClose={() => setProfileModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#002970', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Agent Profile Details</span>
          {!isEditingProfile && (
            <Button
              size="small"
              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
              onClick={() => setIsEditingProfile(true)}
              sx={{ color: '#ff5a00', fontWeight: 700 }}
            >
              Edit Details
            </Button>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {profileMsg.text && (
            <Alert severity={profileMsg.type || 'info'} sx={{ mb: 2, mt: 1 }}>
              {profileMsg.text}
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mb: 3, position: 'relative' }}>
            {/* Instagram-style Avatar with Camera Overlay Edit Button */}
            <Box sx={{ position: 'relative', display: 'inline-block', margin: '0 auto', mb: 1 }}>
              <Avatar
                src={user?.avatar_url || ''}
                sx={{
                  width: 84,
                  height: 84,
                  bgcolor: '#002970',
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(0,41,112,0.2)',
                  border: '3px solid #ffffff',
                }}
              >
                {user?.name ? user.name[0] : 'P'}
              </Avatar>

              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: -4,
                  bgcolor: '#ff5a00',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  '&:hover': { bgcolor: '#d94b00' },
                  width: 32,
                  height: 32,
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {uploadingImage ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PhotoCameraIcon sx={{ fontSize: 17 }} />
                )}
              </IconButton>
            </Box>

            <Typography variant="caption" sx={{ display: 'block', color: '#ff5a00', fontWeight: 600, mb: 1 }}>
              Click camera icon to change display picture
            </Typography>

            <Chip
              icon={<VerifiedUserIcon sx={{ fontSize: '14px !important' }} />}
              label="VERIFIED INSURANCE AGENT"
              color="success"
              size="small"
              sx={{ mt: 0.5, fontWeight: 700 }}
            />
          </Box>

          {/* Form / Readonly View */}
          {isEditingProfile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Agent Full Name"
                size="small"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email Address"
                size="small"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Contact Phone Number"
                size="small"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+91 98765 00001"
                fullWidth
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#002970' }}>
                  {user?.name || 'Priya Nair'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(0, 41, 112, 0.03)', p: 1.5, borderRadius: 2 }}>
                <EmailIcon sx={{ color: '#002970' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontWeight: 600 }}>
                    Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#002970' }}>
                    {user?.email || 'agent@insure.com'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(0, 41, 112, 0.03)', p: 1.5, borderRadius: 2 }}>
                <PhoneIcon sx={{ color: '#002970' }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontWeight: 600 }}>
                    Phone Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#002970' }}>
                    {user?.phone || '+91 98765 00001'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {isEditingProfile ? (
            <>
              <Button onClick={() => setIsEditingProfile(false)} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfileDetails}
                variant="contained"
                color="secondary"
                startIcon={savingProfile ? null : <SaveIcon />}
                disabled={savingProfile}
                sx={{ fontWeight: 700 }}
              >
                {savingProfile ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setProfileModalOpen(false)} variant="contained" color="primary" fullWidth>
              Close Profile
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
