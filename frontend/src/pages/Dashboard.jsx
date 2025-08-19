import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  PendingActions as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { 
    employees, 
    leaveRequests, 
    systemStats, 
    leaveStats,
    actions, 
    loading 
  } = useAppContext();

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch fresh data when dashboard loads
    actions.fetchLeaveStats();
    actions.fetchDepartmentStats();
    
    // Set up recent activity
    const recent = leaveRequests
      .slice(0, 5)
      .map(request => ({
        ...request,
        timestamp: request.created_at,
      }));
    setRecentActivity(recent);
  }, [leaveRequests]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <ApprovedIcon color="success" />;
      case 'rejected': return <RejectedIcon color="error" />;
      case 'pending': return <PendingIcon color="warning" />;
      default: return <AssignmentIcon />;
    }
  };

  const statsCards = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      change: '+2 this month',
    },
    {
      title: 'Total Requests',
      value: leaveRequests.length,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      change: `${leaveRequests.filter(req => req.status === 'pending').length} pending`,
    },
    {
      title: 'Pending Approvals',
      value: leaveRequests.filter(req => req.status === 'pending').length,
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      change: 'Requires attention',
    },
    {
      title: 'Approved This Month',
      value: leaveRequests.filter(req => {
        const requestDate = new Date(req.created_at);
        const currentMonth = new Date().getMonth();
        return req.status === 'approved' && requestDate.getMonth() === currentMonth;
      }).length,
      icon: <ApprovedIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      change: 'Last 30 days',
    },
  ];

  const departmentUtilization = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = {
        name: emp.department,
        total: 0,
        used: 0,
      };
    }
    acc[emp.department].total += 24; // Annual leave entitlement
    acc[emp.department].used += (24 - emp.annual_leave_balance);
    return acc;
  }, {});

  const utilizationData = Object.values(departmentUtilization).map(dept => ({
    ...dept,
    percentage: dept.total > 0 ? Math.round((dept.used / dept.total) * 100) : 0,
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to Symplora Leave Management System
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => {
              actions.fetchEmployees();
              actions.fetchLeaveRequests();
              actions.fetchSystemStats();
            }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {employees.length === 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={actions.quickSetup}
              disabled={loading}
            >
              Load Demo Data
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Recent Leave Requests
                </Typography>
                <Button
                  size="small"
                  onClick={() => window.location.href = '/leave-requests'}
                >
                  View All
                </Button>
              </Box>
              
              {recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No leave requests yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submit your first leave request to get started
                  </Typography>
                </Box>
              ) : (
                <List>
                  {recentActivity.map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {getStatusIcon(request.status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2">
                                {request.employee_name}
                              </Typography>
                              <Chip
                                label={request.status}
                                color={getStatusColor(request.status)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {request.leave_type.charAt(0).toUpperCase() + request.leave_type.slice(1)} leave • {' '}
                                {request.start_date} to {request.end_date} • {' '}
                                {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.reason}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Department Leave Utilization */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Leave Utilization by Department
              </Typography>
              
              {utilizationData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {utilizationData.map((dept, index) => (
                    <Box key={dept.name} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{dept.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dept.percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={dept.percentage}
                        color={dept.percentage > 80 ? 'error' : dept.percentage > 60 ? 'warning' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {dept.used} of {dept.total} days used
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  All systems operational • Last updated: {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" fontWeight="bold">
                  ✓
                </Typography>
                <Typography variant="body2">
                  Healthy
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
