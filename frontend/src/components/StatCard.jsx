import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';

export default function StatCard({ title, value, icon, color = '#ff5a00', subtitle }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1.5px solid',
        borderColor: 'divider',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: '#ff5a00',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 12px 30px -6px rgba(0, 0, 0, 0.6)'
            : '0 12px 30px -6px rgba(0, 41, 112, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.06em', fontSize: '0.72rem' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mt: 0.5, letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
        </Box>

        <Avatar
          sx={{
            bgcolor: `${color}15`,
            color: color,
            width: 48,
            height: 48,
            borderRadius: 3,
            border: `1px solid ${color}35`,
          }}
        >
          {icon}
        </Avatar>
      </Box>

      {subtitle && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {subtitle}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
