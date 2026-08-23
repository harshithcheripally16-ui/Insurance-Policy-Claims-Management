import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#002970', // Deep Corporate Navy
      light: '#1e4894',
      dark: '#001848',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff5a00', // Signature Vibrant Orange
      light: '#ff7b33',
      dark: '#d94b00',
      contrastText: '#ffffff',
    },
    teal: {
      main: '#00a896', // Coverage Accent Teal
      light: '#02c39a',
      dark: '#028090',
      contrastText: '#ffffff',
    },
    background: {
      default: '#edf5ff', // Soft Ice Blue
      paper: '#ffffff',
    },
    text: {
      primary: '#081226',
      secondary: '#55657e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#002970',
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 700,
      color: '#002970',
    },
    h6: {
      fontWeight: 600,
      color: '#002970',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 18px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
        containedPrimary: {
          backgroundColor: '#002970',
          '&:hover': {
            backgroundColor: '#001848',
          },
        },
        containedSecondary: {
          backgroundColor: '#ff5a00',
          '&:hover': {
            backgroundColor: '#d94b00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 41, 112, 0.07)',
          border: '1px solid rgba(0, 41, 112, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 41, 112, 0.07)',
        },
      },
    },
  },
});

export default theme;
