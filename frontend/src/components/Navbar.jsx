import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge, Menu, MenuItem,
  Avatar, Chip, Divider, Button, ListItemText, ListItemIcon
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const roleColors = {
    ADMIN: 'error',
    CLAIMS_OFFICER: 'warning',
    AGENT: 'info',
    CUSTOMER: 'success'
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#ffffff', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && (
            <IconButton
              onClick={onMobileMenuToggle}
              edge="start"
              sx={{ color: '#334155', display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon sx={{ color: '#1e3a8a', fontSize: { xs: 26, sm: 32 } }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.5px', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              InsurCare <Typography component="span" variant="caption" sx={{ color: '#64748b', fontWeight: 600, ml: 0.5, display: { xs: 'none', sm: 'inline' } }}>PRO</Typography>
            </Typography>
          </Box>
        </Box>

        {/* User Actions & Notifications */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {/* Notification Bell */}
            <IconButton onClick={(e) => setAnchorElNotif(e.currentTarget)} color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: '#475569' }} />
              </Badge>
            </IconButton>

            {/* Notifications Dropdown Menu */}
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={() => setAnchorElNotif(null)}
              PaperProps={{ sx: { width: { xs: 290, sm: 340 }, maxHeight: 400, mt: 1, borderRadius: 2 } }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Button size="small" onClick={handleMarkAllRead} startIcon={<CheckCircleIcon />}>
                    Mark read
                  </Button>
                )}
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">No notifications</Typography>
                </MenuItem>
              ) : (
                notifications.map((n) => (
                  <MenuItem key={n.id} onClick={() => setAnchorElNotif(null)} sx={{ bgcolor: n.is_read ? 'transparent' : '#f0f9ff', py: 1.5 }}>
                    <ListItemText
                      primary={n.title}
                      secondary={n.message}
                      primaryTypographyProps={{ variant: 'subtitle2', fontWeight: n.is_read ? 500 : 700 }}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: false }}
                    />
                  </MenuItem>
                ))
              )}
            </Menu>

            <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', display: { xs: 'none', sm: 'block' } }} />

            {/* User Profile Info & Menu */}
            <Box 
              onClick={(e) => setAnchorElUser(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' } }}
            >
              <Avatar sx={{ bgcolor: '#1e3a8a', width: 34, height: 34, fontSize: 13, fontWeight: 700 }}>
                {user.full_name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                  {user.full_name}
                </Typography>
                <Chip 
                  label={user.role.replace('_', ' ')} 
                  size="small" 
                  color={roleColors[user.role] || 'default'} 
                  sx={{ height: 18, fontSize: 10, mt: 0.2 }} 
                />
              </Box>
            </Box>

            {/* User Dropdown Menu */}
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
              PaperProps={{ sx: { width: 200, mt: 1 } }}
            >
              <MenuItem onClick={logout}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText primary="Sign Out" primaryTypographyProps={{ color: 'error' }} />
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
