import React from 'react';
import { Chip, Box, Tooltip } from '@mui/material';
import ShieldAlertIcon from '@mui/icons-material/Warning';
import ShieldCheckIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

export default function ClaimRiskChip({ score = 0, level = 'LOW', flags = '[]' }) {
  let color = 'success';
  let icon = <ShieldCheckIcon />;

  if (level === 'HIGH') {
    color = 'error';
    icon = <ShieldAlertIcon />;
  } else if (level === 'MEDIUM') {
    color = 'warning';
    icon = <InfoIcon />;
  }

  let flagList = [];
  try {
    flagList = typeof flags === 'string' ? JSON.parse(flags) : flags;
  } catch (e) {
    flagList = [];
  }

  const tooltipText = flagList.length > 0
    ? `Risk Indicators: ${flagList.join(' | ')}`
    : `Risk Score: ${score}/100`;

  return (
    <Tooltip title={tooltipText} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Chip
          icon={icon}
          label={`${level} (${score})`}
          color={color}
          size="small"
          sx={{ fontWeight: 700, px: 0.5 }}
        />
      </Box>
    </Tooltip>
  );
}
