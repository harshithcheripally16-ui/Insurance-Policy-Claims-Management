import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge, Menu,
  MenuItem, Avatar, Button, Tooltip, Divider, ListItemText, ListItemIcon, Switch
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ThemeContext';
import ProfileDialog from './ProfileDialog';
import api from '../services/api';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout, login } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const [notifications, setNotifications] = useState([]);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          {/* Brand & Mobile Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMobileMenuToggle}
              sx={{ display: { md: 'none' }, color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                <ShieldIcon sx={{ color: '#ffffff', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                InsurCare <Typography component="span" variant="caption" sx={{ bgcolor: 'primary.light', color: '#ffffff', px: 1, py: 0.3, borderRadius: 1, fontWeight: 700, ml: 0.5 }}>PRO</Typography>
              </Typography>
            </Box>
          </Box>

          {/* Right Section: Notifications & User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Notifications Dropdown */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setAnchorElNotif(e.currentTarget)}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                  transition: 'all 0.2s ease'
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={() => setAnchorElNotif(null)}
              PaperProps={{
                sx: { width: 340, maxHeight: 420, p: 0, mt: 1.5, borderRadius: 3, boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Notifications ({notifications.length})
                </Typography>
                {unreadCount > 0 && (
                  <Button size="small" startIcon={<CheckCircleIcon />} onClick={handleMarkAllRead}>
                    Mark all read
                  </Button>
                )}
              </Box>

              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No new notifications</Typography>
                </Box>
              ) : (
                notifications.map((n) => (
                  <MenuItem key={n.id} onClick={() => setAnchorElNotif(null)} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'normal' }}>
                    <ListItemText
                      primary={n.title}
                      secondary={n.message}
                      primaryTypographyProps={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.85rem' }}
                      secondaryTypographyProps={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.3 }}
                    />
                  </MenuItem>
                ))
              )}
            </Menu>

            {/* User Profile Avatar & Menu */}
            {user && (
              <>
                <Box
                  onClick={(e) => setAnchorElUser(e.currentTarget)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    pl: 1,
                    pr: 1.5,
                    py: 0.6,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                      {user.full_name?.replace(/\s*\([^)]*\)/, '')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, fontSize: '0.7rem' }}>
                      Customer Account
                    </Typography>
                  </Box>
                </Box>

                <Menu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={() => setAnchorElUser(null)}
                  PaperProps={{ sx: { width: 240, mt: 1.5, borderRadius: 3 } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {user.full_name?.replace(/\s*\([^)]*\)/, '')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{user.email}</Typography>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Profile Edit Option */}
                  <MenuItem onClick={() => { setAnchorElUser(null); setOpenProfileModal(true); }} sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>View & Edit Profile</Typography>
                  </MenuItem>

                  {/* Dark/Light Mode Switch Toggle */}
                  <MenuItem onClick={toggleColorMode} sx={{ py: 1, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32, color: mode === 'dark' ? '#f59e0b' : '#64748b' }}>
                        {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </Typography>
                    </Box>
                    <Switch
                      size="small"
                      checked={mode === 'dark'}
                      onChange={(e) => { e.stopPropagation(); toggleColorMode(); }}
                    />
                  </MenuItem>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Logout Option */}
                  <MenuItem onClick={() => { setAnchorElUser(null); logout(); }} sx={{ color: '#ef4444', py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32, color: '#ef4444' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Sign Out</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* CUSTOMER PROFILE VIEW & EDIT MODAL */}
      <ProfileDialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        user={user}
        onProfileUpdated={(updatedUser) => {
          login(user.email, 'password123');
        }}
      />
    </>
  );
}
