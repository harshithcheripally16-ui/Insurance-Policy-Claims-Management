import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Paper, Drawer, Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
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
      link.setAttribute('download', 'insurance_agent_sales_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  // Insurance Agent Dedicated Menu (Customer & Policy CRUD Administration Only)
  const navItems = [
    { label: 'Agent Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Policy Catalog', path: '/policies/catalog', icon: <CategoryIcon /> },
    { label: 'Customer Policies (CRUD)', path: '/policies', icon: <PolicyIcon /> },
    { label: 'Customer Directory', path: '/users', icon: <PeopleIcon /> },
  ];

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', p: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
      <Box>
        {/* Role Badge Indicator */}
        <Box sx={{ px: 1, mb: 2 }}>
          <Chip
            icon={<SupportAgentIcon fontSize="small" />}
            label="Agent Policy Admin"
            color="info"
            size="small"
            sx={{ fontWeight: 700, width: '100%', justifyContent: 'flex-start', px: 1 }}
          />
        </Box>

        <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          Agent Scope & Operations
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
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
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
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'secondary.main' }}>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText
            primary="Export Policy Report"
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, bgcolor: 'background.paper' },
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
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}
      >
        {sidebarContent}
      </Paper>
    </>
  );
}
