import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box, Avatar, Menu,
  MenuItem, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip
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

import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logoutUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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
          {/* Left Brand section: Hamburger button immediately to the left of brand logo */}
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
                policybazaar<span style={{ color: '#ff5a00' }}>.pro</span>
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
              <MenuItem onClick={() => { setAnchorEl(null); setProfileModalOpen(true); }}>
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

      {/* Agent Profile Modal */}
      <Dialog open={profileModalOpen} onClose={() => setProfileModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#002970', borderBottom: '1px solid #eee' }}>
          Agent Profile Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                bgcolor: '#002970',
                fontSize: '2rem',
                margin: '0 auto',
                mb: 1,
                boxShadow: '0 4px 12px rgba(0,41,112,0.2)'
              }}
            >
              {user?.name ? user.name[0] : 'P'}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#002970' }}>
              {user?.name || 'Priya Nair'}
            </Typography>
            <Chip
              icon={<VerifiedUserIcon sx={{ fontSize: '14px !important' }} />}
              label="VERIFIED INSURANCE AGENT"
              color="success"
              size="small"
              sx={{ mt: 1, fontWeight: 700 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon sx={{ color: '#002970' }} />
              <Typography variant="body2">{user?.email || 'agent@insure.com'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneIcon sx={{ color: '#002970' }} />
              <Typography variant="body2">{user?.phone || '+91 98765 00001'}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProfileModalOpen(false)} variant="contained" color="primary" fullWidth>
            Close Profile
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
