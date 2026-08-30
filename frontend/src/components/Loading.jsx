import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Loading system data...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        width: '100%',
      }}
    >
      <CircularProgress size={40} thickness={4} color="primary" />
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
