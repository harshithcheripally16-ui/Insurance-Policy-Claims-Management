import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography,
  Divider, Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PolicyIcon from '@mui/icons-material/Policy';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import SecurityIcon from '@mui/icons-material/Security';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Agent Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Insurance Plans', icon: <MenuBookIcon />, path: '/policies/catalog', badge: 'CATALOG' },
    { text: 'Customer Policies', icon: <PolicyIcon />, path: '/policies' },
    { text: 'Customer Directory', icon: <PeopleIcon />, path: '/users' },
    { text: 'Claims Assistance', icon: <AssignmentLateIcon />, path: '/claims' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 270,
          background: 'linear-gradient(180deg, #002970 0%, #001848 100%)',
          color: '#ffffff',
          boxShadow: '4px 0 25px rgba(0,0,0,0.25)',
        },
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#ff5a00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}
        >
          <SecurityIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>
          policybazaar<span style={{ color: '#ff5a00' }}>.pro</span>
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1 }}>
          AGENT NAVIGATION
        </Typography>
      </Box>

      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.8,
                bgcolor: isSelected ? 'rgba(255, 90, 0, 0.2)' : 'transparent',
                borderLeft: isSelected ? '4px solid #ff5a00' : '4px solid transparent',
                color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isSelected ? '#ff5a00' : 'rgba(255, 255, 255, 0.7)',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.92rem',
                  fontWeight: isSelected ? 700 : 500,
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    bgcolor: '#ff5a00',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.62rem',
                    height: 18,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          Policybazaar Pro Agent Desk v1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
