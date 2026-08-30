import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const ErrorMessage = ({ title = 'An error occurred', message, onRetry }) => {
  return (
    <Box sx={{ my: 2, width: '100%' }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
              Retry
            </Button>
          )
        }
        sx={{ borderRadius: 2 }}
      >
        {title && <AlertTitle fontWeight="600">{title}</AlertTitle>}
        {message || 'Unable to complete the requested administrative operation.'}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
