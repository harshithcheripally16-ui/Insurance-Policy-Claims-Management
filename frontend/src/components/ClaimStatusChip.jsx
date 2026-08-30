import React from 'react';
import { Chip } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    color: 'warning',
    variant: 'filled',
    icon: <HourglassEmptyIcon fontSize="small" />,
    bgcolor: '#fef3c7',
    textColor: '#92400e',
    borderColor: '#fde68a',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'info',
    variant: 'filled',
    icon: <RateReviewIcon fontSize="small" />,
    bgcolor: '#e0f2fe',
    textColor: '#075985',
    borderColor: '#bae6fd',
  },
  APPROVED: {
    label: 'Approved',
    color: 'success',
    variant: 'filled',
    icon: <CheckCircleIcon fontSize="small" />,
    bgcolor: '#dcfce7',
    textColor: '#166534',
    borderColor: '#bbf7d0',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'error',
    variant: 'filled',
    icon: <CancelIcon fontSize="small" />,
    bgcolor: '#fee2e2',
    textColor: '#991b1b',
    borderColor: '#fecaca',
  },
};

const ClaimStatusChip = ({ status, size = 'small' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Pending',
    bgcolor: '#f1f5f9',
    textColor: '#475569',
    borderColor: '#cbd5e1',
    icon: null,
  };

  return (
    <Chip
      size={size}
      icon={config.icon}
      label={config.label}
      sx={{
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        bgcolor: config.bgcolor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
        '& .MuiChip-icon': {
          color: config.textColor,
        },
      }}
    />
  );
};

export default ClaimStatusChip;
