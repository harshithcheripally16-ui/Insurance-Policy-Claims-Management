import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const StatCard = ({ title, value, icon, color = '#002970', accentColor = '#ff5a00', subtitle }) => {
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 25px rgba(0, 41, 112, 0.12)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: accentColor,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#002970', mt: 0.5 }}>
              {value}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: `${color}12`,
              color: color,
              width: 48,
              height: 48,
              borderRadius: 3,
            }}
          >
            {icon}
          </Avatar>
        </Box>

        {subtitle && (
          <Typography variant="caption" sx={{ color: '#00a896', fontWeight: 600, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
