import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import {
  Menu as MenuIcon
} from '@mui/icons-material';

const Header = ({ 
  currentPage, 
  setMobileOpen, 
  mobileOpen, 
  handleLoadDemo, 
  loading,
  navigationItems 
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - 280px)` },
        ml: { md: '280px' },
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {navigationItems.find(item => item.path.substring(1) === currentPage)?.text || 'Dashboard'}
        </Typography>

        <Button
          color="inherit"
          onClick={handleLoadDemo}
          disabled={loading}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {loading ? 'Loading...' : 'Load Demo Data'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
