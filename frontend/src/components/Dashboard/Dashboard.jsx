import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Avatar
} from '@mui/material';
import {
  People as PeopleIcon,
  RequestPage as RequestPageIcon,
  Check as CheckIcon,
  Business as BusinessIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Professional Dashboard Component
const Dashboard = ({ employees, leaveRequests, onLoadDemo }) => {
  const pendingRequests = leaveRequests.filter(req => req.status === 'Pending');
  const approvedRequests = leaveRequests.filter(req => req.status === 'Approved');

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      description: 'Active employees in system'
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: <RequestPageIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      description: 'Awaiting approval'
    },
    {
      title: 'Approved Leaves',
      value: approvedRequests.length,
      icon: <CheckIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      description: 'This month'
    },
    {
      title: 'Departments',
      value: [...new Set(employees.map(emp => emp.department))].length,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      description: 'Active departments'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Symplora
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Professional Leave Management System
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: `${stat.color}.main`, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold" color={`${stat.color}.main`}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {employees.length === 0 && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <HomeIcon sx={{ fontSize: 64, mb: 2, opacity: 0.8 }} />
            <Typography variant="h5" gutterBottom>
              Welcome to Your Leave Management System!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Get started by loading sample Indian employee data to explore all features of the system.
            </Typography>
            <Button 
              variant="contained" 
              onClick={onLoadDemo} 
              size="large"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Load Indian Demo Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Leave Requests
          </Typography>
          {leaveRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <RequestPageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No leave requests yet</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests.slice(0, 5).map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {request.employee_name?.charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle2">
                          {request.employee_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={request.leave_type} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.start_date} to {request.end_date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        size="small" 
                        color={
                          request.status === 'Approved' ? 'success' :
                          request.status === 'Rejected' ? 'error' :
                          request.status === 'Pending' ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
