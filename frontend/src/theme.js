import { createTheme } from '@mui/material/styles';

// Policybazaar (70% Similarity Inspired Design System)
export const getAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#ff7a28' : '#ff5a00', // Policybazaar Signature Orange
        light: '#ff8533',
        dark: '#cc4800',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#2563eb' : '#002970', // Policybazaar Deep Navy Blue
        light: '#1d4ed8',
        dark: '#001e54',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#081226' : '#f4f7fa',
        paper: isDark ? '#0f1c33' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f8fafc' : '#001e54',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      success: {
        main: '#00a896',
        light: isDark ? '#064e3b' : '#e6f7f5',
        dark: '#007a6e',
      },
      warning: {
        main: '#ff9800',
        light: isDark ? '#78350f' : '#fff3e0',
        dark: '#e65100',
      },
      error: {
        main: '#dc2626',
        light: isDark ? '#7f1d1d' : '#fef2f2',
        dark: '#991b1b',
      },
      info: {
        main: '#0284c7',
        light: isDark ? '#0c4a6e' : '#e0f2fe',
        dark: '#0369a1',
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Outfit", "Inter", "Segoe UI", sans-serif',
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 800, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 700 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark ? '0 8px 24px -4px rgba(0, 0, 0, 0.5)' : '0 6px 20px -4px rgba(0, 41, 112, 0.06)',
            border: isDark ? '1px solid #1e2d4a' : '1px solid #e5e7eb',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '9px 22px',
            boxShadow: 'none',
            fontWeight: 700,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 6px 20px -2px rgba(255, 90, 0, 0.35)',
              transform: 'translateY(-1px)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #ff5a00 0%, #ff7a28 100%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #e65100 0%, #ff5a00 100%)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #002970 0%, #001e54 100%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #001e54 0%, #001235 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark ? '0 8px 24px -4px rgba(0, 0, 0, 0.5)' : '0 6px 20px -4px rgba(0, 41, 112, 0.06)',
            border: isDark ? '1px solid #1e2d4a' : '1px solid #e5e7eb',
            transition: 'all 0.25s ease-in-out',
            '&:hover': {
              boxShadow: isDark ? '0 12px 32px -4px rgba(0, 0, 0, 0.7)' : '0 12px 32px -4px rgba(0, 41, 112, 0.12)',
              borderColor: '#ff5a00',
              transform: 'translateY(-3px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: 8,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            borderBottom: isDark ? '1px solid #1e2d4a' : '1px solid #edf2f7',
            padding: '14px 18px',
          },
          head: {
            fontWeight: 800,
            color: isDark ? '#94a3b8' : '#002970',
            backgroundColor: isDark ? '#14223d' : '#f8fafc',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            boxShadow: '0 25px 50px -12px rgba(0, 41, 112, 0.3)',
          },
        },
      },
    },
  });
};

const defaultTheme = getAppTheme('light');
export default defaultTheme;
