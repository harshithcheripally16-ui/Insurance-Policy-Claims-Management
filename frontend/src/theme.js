import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#3b82f6' : '#1e3a8a',
        light: '#60a5fa',
        dark: '#1e3a8a',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0d9488',
        light: '#14b8a6',
        dark: '#0f766e',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0b0f19' : '#f8fafc',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f3f4f6' : '#0f172a',
        secondary: isDark ? '#9ca3af' : '#64748b',
      },
      success: {
        main: '#10b981',
        light: isDark ? '#064e3b' : '#dcfce7',
        dark: '#047857',
      },
      warning: {
        main: '#f59e0b',
        light: isDark ? '#78350f' : '#fef3c7',
        dark: '#b45309',
      },
      error: {
        main: '#ef4444',
        light: isDark ? '#7f1d1d' : '#fee2e2',
        dark: '#b91c1c',
      },
      info: {
        main: '#3b82f6',
        light: isDark ? '#1e3a8a' : '#dbeafe',
        dark: '#1d4ed8',
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 800, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)' : '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            boxShadow: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 6px 16px -4px rgba(37, 99, 235, 0.3)',
              transform: 'translateY(-1px)',
            },
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
              : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)' : '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: isDark ? '0 12px 28px -6px rgba(0, 0, 0, 0.6)' : '0 12px 28px -6px rgba(15, 23, 42, 0.09)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9',
            padding: '14px 16px',
          },
          head: {
            fontWeight: 700,
            color: isDark ? '#9ca3af' : '#475569',
            backgroundColor: isDark ? '#1f2937' : '#f8fafc',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
  });
};

const defaultTheme = getAppTheme('light');
export default defaultTheme;
