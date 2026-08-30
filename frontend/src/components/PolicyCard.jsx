import React from 'react';
import { Card, CardContent, CardActions, Typography, Box, Chip, Button, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CATEGORY_META = {
  HEALTH: { color: '#0ea5e9', bgcolor: '#e0f2fe', icon: <HealthAndSafetyIcon fontSize="small" /> },
  LIFE: { color: '#ec4899', bgcolor: '#fce7f3', icon: <FavoriteIcon fontSize="small" /> },
  VEHICLE: { color: '#f59e0b', bgcolor: '#fef3c7', icon: <DirectionsCarIcon fontSize="small" /> },
  TRAVEL: { color: '#8b5cf6', bgcolor: '#ede9fe', icon: <FlightTakeoffIcon fontSize="small" /> },
  HOME: { color: '#10b981', bgcolor: '#d1fae5', icon: <HomeIcon fontSize="small" /> },
};

const PolicyCard = ({ policy }) => {
  const meta = CATEGORY_META[policy.type] || {
    color: '#64748b',
    bgcolor: '#f1f5f9',
    icon: <VerifiedUserIcon fontSize="small" />,
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        {/* Header Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip
            icon={meta.icon}
            label={policy.type}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: meta.bgcolor,
              color: meta.color,
              '& .MuiChip-icon': { color: meta.color },
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {policy.policy_number}
          </Typography>
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 1, minHeight: 48, lineHeight: 1.3 }}>
          {policy.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2.5,
            minHeight: 40,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {policy.description || 'Comprehensive insurance protection with reliable claims support and fast settlement.'}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Pricing & Duration */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              PREMIUM
            </Typography>
            <Typography variant="h5" fontWeight="800" color="primary.main">₹{policy.premium?.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              TERM
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="700">
                {policy.duration_months} Months
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          component={Link}
          to={`/customer/policies/${policy.id}`}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Details
        </Button>
        <Button
          component={Link}
          to={`/customer/policies/${policy.id}/purchase`}
          variant="contained"
          size="small"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Purchase
        </Button>
      </CardActions>
    </Card>
  );
};

export default PolicyCard;
