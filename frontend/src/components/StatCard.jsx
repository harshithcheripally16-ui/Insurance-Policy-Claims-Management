import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';

export default function StatCard({ title, value, icon, color = '#1e3a8a', subtitle }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.08)',
          borderColor: '#cbd5e1',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.72rem' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5, letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
        </Box>

        <Avatar
          sx={{
            bgcolor: `${color}15`,
            color: color,
            width: 46,
            height: 46,
            borderRadius: 3,
            border: `1px solid ${color}30`,
          }}
        >
          {icon}
        </Avatar>
      </Box>

      {subtitle && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
            {subtitle}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
