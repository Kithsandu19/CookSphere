import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E1306C', // Instagram primary pink
      light: '#F56040', // Instagram orange
      dark: '#833AB4', // Instagram purple
      contrastText: '#fff',
    },
    secondary: {
      main: '#405DE6', // Instagram blue
      light: '#5B51D8', // Light blu
      dark: '#C13584', // Deep pink
      contrastText: '#fff',
    },
    background: {
      default: '#fff',
      paper: '#fff',
      gradient: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80)',
      gradientLight: 'linear-gradient(45deg, rgba(64,93,230,0.2), rgba(225,48,108,0.2))',
    },
    text: {
      primary: '#262626',
      secondary: '#8e8e8e',
    },
    grey: {
      100: '#fafafa',
      200: '#efefef',
      300: '#dbdbdb',
      400: '#8e8e8e',
    },
    success: {
      main: '#00B894',
    },
    warning: {
      main: '#FDCB6E',
    },
    error: {
      main: '#D63031',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #dbdbdb',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '8px 20px',
        },
        contained: {
          background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C)',
          backgroundSize: '200% auto',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundPosition: 'right center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderColor: '#E1306C',
          color: '#E1306C',
          '&:hover': {
            backgroundColor: 'rgba(225,48,108,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          borderRadius: '12px',
          border: '1px solid #dbdbdb',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(225,48,108,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E1306C',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.MuiChip-filled': {
            background: 'linear-gradient(45deg, #405DE6, #C13584)',
            color: 'white',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          borderRadius: '12px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#dbdbdb',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #dbdbdb',
        },
      },
    },
  },
});

export default theme; 