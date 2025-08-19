import { createTheme } from '@mui/material/styles';

// Professional theme with Indian-inspired colors
export const theme = createTheme({
  palette: {
    primary: { 
      main: '#1565C0', // Deep blue
      light: '#42A5F5',
      dark: '#0D47A1'
    },
    secondary: { 
      main: '#FF6F00', // Saffron orange
      light: '#FFB74D',
      dark: '#E65100'
    },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
    warning: { main: '#F57C00' },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          paddingX: 24,
          paddingY: 12
        },
      },
    },
  },
});

export const drawerWidth = 280;
