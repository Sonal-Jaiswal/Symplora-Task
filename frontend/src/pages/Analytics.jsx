import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

import { useAppContext } from '../context/AppContext';

const Analytics = () => {
  const { 
    employees, 
    leaveRequests, 
    departmentStats, 
    leaveStats,
    actions 
  } = useAppContext();

  useEffect(() => {
    actions.fetchDepartmentStats();
    actions.fetchLeaveStats();
  }, []);

  // Calculate department-wise leave utilization
  const departmentAnalytics = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = {
        name: emp.department,
        totalEmployees: 0,
        totalAnnualLeave: 0,
        usedAnnualLeave: 0,
        totalSickLeave: 0,
        usedSickLeave: 0,
      };
    }
    
    acc[emp.department].totalEmployees += 1;
    acc[emp.department].totalAnnualLeave += 24;
    acc[emp.department].usedAnnualLeave += (24 - (emp.annual_leave_balance || 0));
    acc[emp.department].totalSickLeave += 12;
    acc[emp.department].usedSickLeave += (12 - (emp.sick_leave_balance || 0));
    
    return acc;
  }, {});

  const departmentData = Object.values(departmentAnalytics).map(dept => ({
    ...dept,
    annualUtilization: dept.totalAnnualLeave > 0 
      ? Math.round((dept.usedAnnualLeave / dept.totalAnnualLeave) * 100) 
      : 0,
    sickUtilization: dept.totalSickLeave > 0 
      ? Math.round((dept.usedSickLeave / dept.totalSickLeave) * 100) 
      : 0,
  }));

  // Leave request analytics
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const monthlyRequests = leaveRequests.filter(req => {
    const reqDate = new Date(req.created_at);
    return reqDate.getFullYear() === currentYear && reqDate.getMonth() === currentMonth;
  });

  const totalLeaveUtilization = employees.length > 0 
    ? Math.round((employees.reduce((sum, emp) => sum + (24 - (emp.annual_leave_balance || 0)), 0) / (employees.length * 24)) * 100)
    : 0;

  const getUtilizationColor = (percentage) => {
    if (percentage > 80) return 'error';
    if (percentage > 60) return 'warning';
    if (percentage > 30) return 'info';
    return 'success';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics & Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Insights into leave utilization and trends across the organization
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {employees.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {leaveRequests.filter(req => req.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved Leaves
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {totalLeaveUtilization}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Utilization
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {monthlyRequests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Month's Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Department Utilization */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department-wise Leave Utilization
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="center">Employees</TableCell>
                      <TableCell align="center">Annual Leave</TableCell>
                      <TableCell align="center">Sick Leave</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      departmentData.map((dept) => (
                        <TableRow key={dept.name} hover>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {dept.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={dept.totalEmployees}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: '100%', mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">
                                  {dept.usedAnnualLeave}/{dept.totalAnnualLeave} days
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {dept.annualUtilization}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={dept.annualUtilization}
                                color={getUtilizationColor(dept.annualUtilization)}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: '100%', mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">
                                  {dept.usedSickLeave}/{dept.totalSickLeave} days
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {dept.sickUtilization}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={dept.sickUtilization}
                                color={getUtilizationColor(dept.sickUtilization)}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Request Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Request Status Distribution
              </Typography>
              
              {leaveRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No requests yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {['pending', 'approved', 'rejected', 'cancelled'].map(status => {
                    const count = leaveRequests.filter(req => req.status === status).length;
                    const percentage = leaveRequests.length > 0 
                      ? Math.round((count / leaveRequests.length) * 100) 
                      : 0;
                    
                    const getStatusColor = (status) => {
                      switch (status) {
                        case 'approved': return 'success';
                        case 'rejected': return 'error';
                        case 'pending': return 'warning';
                        default: return 'default';
                      }
                    };

                    return (
                      <Box key={status} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {status}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {count} ({percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color={getStatusColor(status)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Leave Type Distribution */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Type Distribution
              </Typography>
              
              {leaveRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No requests yet
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {['annual', 'sick', 'emergency'].map(type => {
                    const count = leaveRequests.filter(req => req.leave_type === type).length;
                    const percentage = leaveRequests.length > 0 
                      ? Math.round((count / leaveRequests.length) * 100) 
                      : 0;

                    return (
                      <Box key={type} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {type} Leave
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {count} ({percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color="primary"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
