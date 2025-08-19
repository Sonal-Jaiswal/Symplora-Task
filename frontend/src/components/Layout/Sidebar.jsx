import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  RequestPage as RequestPageIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

// Navigation items
const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
  { text: 'Leave Requests', icon: <RequestPageIcon />, path: '/leave-requests' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

const Sidebar = ({ currentPage, setCurrentPage, isMobile, setMobileOpen }) => {
  const handleNavigation = (path) => {
    setCurrentPage(path.substring(1));
    if (isMobile) setMobileOpen(false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #1565C0 0%, #FF6F00 100%)', color: 'white' }}>
        <Typography variant="h5" fontWeight="bold">
          Symplora
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Leave Management System
        </Typography>
      </Box>
      
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={currentPage === item.path.substring(1)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Professional Leave Management
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
