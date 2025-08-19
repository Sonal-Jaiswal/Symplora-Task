import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Analytics Component
const Analytics = ({ employees, leaveRequests }) => {
  const departmentStats = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = { total: 0, avgAnnual: 0, avgSick: 0 };
    }
    acc[emp.department].total += 1;
    acc[emp.department].avgAnnual += emp.annual_leave_balance;
    acc[emp.department].avgSick += emp.sick_leave_balance;
    return acc;
  }, {});

  Object.keys(departmentStats).forEach(dept => {
    const stats = departmentStats[dept];
    stats.avgAnnual = Math.round(stats.avgAnnual / stats.total);
    stats.avgSick = Math.round(stats.avgSick / stats.total);
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics & Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Insights into leave patterns and department statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="center">Employees</TableCell>
                      <TableCell align="center">Avg Annual Leave</TableCell>
                      <TableCell align="center">Avg Sick Leave</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(departmentStats).map(([dept, stats]) => (
                      <TableRow key={dept}>
                        <TableCell>{dept}</TableCell>
                        <TableCell align="center">{stats.total}</TableCell>
                        <TableCell align="center">{stats.avgAnnual}</TableCell>
                        <TableCell align="center">{stats.avgSick}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Leave Request Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                {['Pending', 'Approved', 'Rejected'].map(status => {
                  const count = leaveRequests.filter(req => req.status === status).length;
                  const color = status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'warning';
                  
                  return (
                    <Box key={status} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {status}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: `${color}.50`, borderRadius: 1, p: 1 }}>
                        <Typography variant="caption" color={`${color}.main`}>
                          {leaveRequests.length > 0 ? Math.round((count / leaveRequests.length) * 100) : 0}% of total requests
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
