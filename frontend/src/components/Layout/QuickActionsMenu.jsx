import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';

import { useAppContext } from '../../context/AppContext';
import AddEmployeeDialog from '../Dialogs/AddEmployeeDialog';
import AddLeaveRequestDialog from '../Dialogs/AddLeaveRequestDialog';

const QuickActionsMenu = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { actions, employees, loading } = useAppContext();
  
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [addLeaveRequestOpen, setAddLeaveRequestOpen] = useState(false);

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Register a new employee in the system',
      icon: <PersonAddIcon color="primary" />,
      action: () => {
        setAddEmployeeOpen(true);
        onClose();
      },
      disabled: false,
    },
    {
      title: 'Submit Leave Request',
      description: 'Apply for leave on behalf of an employee',
      icon: <AssignmentIcon color="success" />,
      action: () => {
        setAddLeaveRequestOpen(true);
        onClose();
      },
      disabled: employees.length === 0,
    },
    {
      title: 'View Analytics',
      description: 'Check leave statistics and trends',
      icon: <AssessmentIcon color="info" />,
      action: () => {
        navigate('/analytics');
        onClose();
      },
      disabled: false,
    },
    {
      title: 'Load Demo Data',
      description: 'Populate system with sample employees and data',
      icon: <PlayArrowIcon color="warning" />,
      action: async () => {
        await actions.quickSetup();
        onClose();
      },
      disabled: loading,
      badge: employees.length === 0 ? 'Recommended' : null,
    },
    {
      title: 'Refresh Data',
      description: 'Reload all data from the server',
      icon: <RefreshIcon />,
      action: async () => {
        await Promise.all([
          actions.fetchEmployees(),
          actions.fetchLeaveRequests(),
          actions.fetchSystemStats(),
        ]);
        onClose();
      },
      disabled: loading,
    },
  ];

  const systemActions = [
    {
      title: 'Export Data',
      description: 'Download system data as CSV',
      icon: <GetAppIcon color="secondary" />,
      action: () => {
        // This would typically trigger a download
        actions.showSnackbar('Export feature coming soon!', 'info');
        onClose();
      },
      disabled: false,
    },
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Typography variant="h6" component="div">
            Quick Actions
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose an action to perform quickly
          </Typography>

          {/* Main Actions */}
          <List disablePadding>
            {quickActions.map((action, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={action.action}
                  disabled={action.disabled || loading}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    {action.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {action.title}
                        </Typography>
                        {action.badge && (
                          <Chip
                            label={action.badge}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={action.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* System Actions */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            System Actions
          </Typography>
          <List disablePadding>
            {systemActions.map((action, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={action.action}
                  disabled={action.disabled || loading}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      backgroundColor: 'secondary.50',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    {action.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={action.title}
                    secondary={action.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Help Text */}
          {employees.length === 0 && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: 'info.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.200',
              }}
            >
              <Typography variant="body2" color="info.dark">
                <strong>Getting Started:</strong> It looks like you're new here! 
                Try "Load Demo Data" to populate the system with sample employees, 
                or "Add Employee" to start building your team manually.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <AddEmployeeDialog
        open={addEmployeeOpen}
        onClose={() => setAddEmployeeOpen(false)}
      />
      
      <AddLeaveRequestDialog
        open={addLeaveRequestOpen}
        onClose={() => setAddLeaveRequestOpen(false)}
      />
    </>
  );
};

export default QuickActionsMenu;
