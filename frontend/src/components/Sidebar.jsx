import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Drawer, Chip, IconButton
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import api from '../services/api';

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'insurance_policy_summary.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export report', err);
    }
  };

  const navItems = [
    { label: 'Agent Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Insurance Plans', path: '/policies/catalog', icon: <CategoryIcon /> },
    { label: 'Customer Policies', path: '/policies', icon: <PolicyIcon /> },
    { label: 'Customer Directory', path: '/users', icon: <PeopleIcon /> },
  ];

  const drawerHeader = (
    <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #002970 0%, #001e54 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldIcon sx={{ color: '#ff5a00', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, color: 'secondary.main', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          InsurCare <Typography component="span" variant="caption" sx={{ bgcolor: '#ff5a00', color: '#ffffff', px: 0.8, py: 0.2, borderRadius: 1, fontWeight: 800, ml: 0.3 }}>PRO</Typography>
        </Typography>
      </Box>

      <IconButton onClick={onMobileClose} size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#ff5a00' } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', p: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
      <Box>
        {/* Role Badge Indicator */}
        <Box sx={{ px: 0.5, mb: 2.5, mt: 1 }}>
          <Chip
            icon={<SupportAgentIcon fontSize="small" sx={{ color: '#ffffff !important' }} />}
            label="Insurance Agent Portal"
            sx={{ fontWeight: 800, width: '100%', justifyContent: 'flex-start', px: 1, bgcolor: '#002970', color: '#ffffff' }}
          />
        </Box>

        <Typography variant="overline" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.7rem' }}>
          Navigation Menu
        </Typography>

        <List sx={{ mt: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (onMobileClose) onMobileClose();
                  }}
                  sx={{
                    borderRadius: 2.5,
                    borderLeft: isActive ? '4px solid #ff5a00' : '4px solid transparent',
                    bgcolor: isActive ? (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 90, 0, 0.15)' : 'rgba(255, 90, 0, 0.08)' : 'transparent',
                    color: isActive ? '#ff5a00' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#ff5a00' : 'text.secondary', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.9rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Export Report Action */}
      <Box sx={{ p: 0.5 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          onClick={handleExportCSV}
          sx={{
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover', borderColor: '#ff5a00' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#ff5a00' }}>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText
            primary="Download Summary"
            primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: 270,
          bgcolor: 'background.paper',
          boxShadow: '0 25px 50px -12px rgba(0, 41, 112, 0.35)',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      }}
    >
      {drawerHeader}
      {sidebarContent}
    </Drawer>
  );
}
