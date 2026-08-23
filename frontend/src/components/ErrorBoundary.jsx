import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            padding: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              maxWidth: 500,
              textAlign: 'center',
              borderRadius: 3,
              borderTop: '5px solid #ff5a00',
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 64, color: '#ff5a00', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#002970', fontWeight: 700, mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              An unexpected display issue occurred in this section of the Insurance Portal.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleReset}
              sx={{ px: 4, py: 1.2, fontWeight: 700 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
