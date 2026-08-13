import React from 'react';
import { Box, Chip, Typography, Paper, Tooltip } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GavelIcon from '@mui/icons-material/Gavel';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../context/AuthContext';

const demoRoles = [
  { label: 'Admin', email: 'admin@insure.com', role: 'ADMIN', color: 'error', icon: <AdminPanelSettingsIcon /> },
  { label: 'Claims Officer', email: 'officer@insure.com', role: 'CLAIMS_OFFICER', color: 'warning', icon: <GavelIcon /> },
  { label: 'Insurance Agent', email: 'agent@insure.com', role: 'AGENT', color: 'info', icon: <SupportAgentIcon /> },
  { label: 'Customer', email: 'customer@insure.com', role: 'CUSTOMER', color: 'success', icon: <PersonIcon /> },
];

export default function RoleDemoBanner() {
  const { user, switchDemoRole } = useAuth();

  return (
    <Paper 
      elevation={0}
      sx={{ 
        bgcolor: '#1e293b', 
        color: '#ffffff', 
        borderRadius: 0, 
        px: { xs: 1.5, sm: 3 }, 
        py: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        gap: 1,
        borderBottom: '1px solid #334155'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
          Role Demo Switcher:
        </Typography>
      </Box>

      {/* Horizontally scrollable MUI Chips container */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          overflowX: 'auto',
          maxWidth: '100%',
          py: 0.5,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#475569', borderRadius: 2 }
        }}
      >
        {demoRoles.map((r) => {
          const isActive = user?.role === r.role;
          return (
            <Tooltip key={r.role} title={`Switch to ${r.label} (${r.email})`}>
              <Chip
                icon={r.icon}
                label={r.label}
                color={r.color}
                size="small"
                variant={isActive ? 'filled' : 'outlined'}
                onClick={() => switchDemoRole(r.email)}
                sx={{
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  borderColor: isActive ? 'transparent' : '#475569',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive ? undefined : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}
