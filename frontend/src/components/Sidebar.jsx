import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Paper, Drawer, Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import AddTaskIcon from '@mui/icons-material/AddTask';
import GavelIcon from '@mui/icons-material/Gavel';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
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

  // Define Role-Specific Main Menus
  const getNavItems = () => {
    switch (user?.role) {
      case 'CUSTOMER':
        return [
          { label: 'Customer Overview', path: '/dashboard', icon: <DashboardIcon /> },
          { label: 'Policy Catalog', path: '/policies/catalog', icon: <CategoryIcon /> },
          { label: 'My Policies', path: '/policies', icon: <PolicyIcon /> },
          { label: 'Submit & Track Claims', path: '/claims', icon: <AssignmentLateIcon /> },
        ];

      case 'AGENT':
        return [
          { label: 'Agent Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { label: 'Policy Catalog', path: '/policies/catalog', icon: <CategoryIcon /> },
          { label: 'Customer Policies', path: '/policies', icon: <PolicyIcon /> },
          { label: 'Customer Claims', path: '/claims', icon: <AssignmentLateIcon /> },
          { label: 'Customer Directory', path: '/users', icon: <PeopleIcon /> },
        ];

      case 'CLAIMS_OFFICER':
        return [
          { label: 'Officer Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { label: 'Review Workbench', path: '/claims', icon: <GavelIcon /> },
          { label: 'Document Attachments', path: '/claims?tab=documents', icon: <FolderSharedIcon /> },
        ];

      case 'ADMIN':
      default:
        // Admin Privileges: Comprehensive combination of Customer, Agent & Officer features
        return [
          { label: 'Master Analytics', path: '/dashboard', icon: <DashboardIcon /> },
          { label: 'Policy Catalog', path: '/policies/catalog', icon: <CategoryIcon /> },
          { label: 'All System Policies', path: '/policies', icon: <PolicyIcon /> },
          { label: 'Claims Workbench', path: '/claims', icon: <GavelIcon /> },
          { label: 'User Directory', path: '/users', icon: <PeopleIcon /> },
        ];
    }
  };

  const navItems = getNavItems();

  const roleMeta = {
    ADMIN: { label: 'Admin Access', color: 'error', icon: <AdminPanelSettingsIcon fontSize="small" /> },
    CLAIMS_OFFICER: { label: 'Officer Menu', color: 'warning', icon: <GavelIcon fontSize="small" /> },
    AGENT: { label: 'Agent Menu', color: 'info', icon: <SupportAgentIcon fontSize="small" /> },
    CUSTOMER: { label: 'Customer Portal', color: 'success', icon: <PersonIcon fontSize="small" /> },
  };

  const currentRole = roleMeta[user?.role] || roleMeta.CUSTOMER;

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', p: 2 }}>
      <Box>
        {/* Role Badge Indicator */}
        <Box sx={{ px: 1, mb: 2 }}>
          <Chip
            icon={currentRole.icon}
            label={currentRole.label}
            color={currentRole.color}
            size="small"
            sx={{ fontWeight: 700, width: '100%', justifyContent: 'flex-start', px: 1 }}
          />
        </Box>

        <Typography variant="overline" sx={{ px: 2, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>
          Dedicated Menu
        </Typography>

        <List sx={{ mt: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname + location.search) === item.path;
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
                      fontSize: '0.88rem',
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
