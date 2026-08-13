import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Paper, Drawer
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'insurance_claims_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Policy Catalog', path: '/policies/catalog', icon: <CategoryIcon /> },
    { label: 'My Policies', path: '/policies', icon: <PolicyIcon /> },
    { label: 'Claims Workbench', path: '/claims', icon: <AssignmentLateIcon /> },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
    navItems.push({ label: 'Manage Users', path: '/users', icon: <PeopleIcon /> });
  }

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', p: 2 }}>
      <Box>
        <Typography variant="overline" sx={{ px: 2, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>
          Main Menu
        </Typography>
        <List sx={{ mt: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (onMobileClose) onMobileClose();
                  }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1e3a8a' : '#475569',
                    '&:hover': {
                      bgcolor: isActive ? '#dbeafe' : '#f8fafc',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#1e3a8a' : '#64748b', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 500,
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
      <Box sx={{ p: 1 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          onClick={handleExportCSV}
          sx={{
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            color: '#334155',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#0d9488' }}>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText
            primary="Export CSV Report"
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* MOBILE TEMPORARY DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* DESKTOP PERSISTENT SIDEBAR */}
      <Paper
        elevation={0}
        sx={{
          width: 240,
          minHeight: 'calc(100vh - 110px)',
          borderRadius: 0,
          borderRight: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: { xs: 'none', md: 'block' },
          flexShrink: 0
        }}
      >
        {sidebarContent}
      </Paper>
    </>
  );
}
