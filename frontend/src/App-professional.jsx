import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar, 
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Fab,
  Snackbar,
  useMediaQuery,
  Divider,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  RequestPage as RequestPageIcon,
  Menu as MenuIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Professional theme with Indian-inspired colors
const theme = createTheme({
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

const drawerWidth = 280;

// Navigation items
const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
  { text: 'Leave Requests', icon: <RequestPageIcon />, path: '/leave-requests' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

// Professional Dashboard Component
const Dashboard = ({ employees, leaveRequests, onLoadDemo }) => {
  const pendingRequests = leaveRequests.filter(req => req.status === 'pending');
  const approvedRequests = leaveRequests.filter(req => req.status === 'approved');

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
                          request.status === 'approved' ? 'success' :
                          request.status === 'rejected' ? 'error' :
                          request.status === 'pending' ? 'warning' : 'default'
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

// Employee Management Component
const EmployeeManagement = ({ employees, onAddEmployee, onLoadDemo }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', department: '', joining_date: ''
  });
  const [error, setError] = useState('');

  const departments = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validate required fields
      if (!formData.name || !formData.email || !formData.department || !formData.joining_date) {
        throw new Error('All fields are required');
      }

      await onAddEmployee(formData);
      setOpen(false);
      setFormData({ name: '', email: '', department: '', joining_date: '' });
    } catch (err) {
      console.error('Error adding employee:', err);
      setError(err.message || 'Failed to add employee');
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Employee Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team members and their information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          size="large"
        >
          Add Employee
        </Button>
      </Box>

      {employees.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PeopleIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No employees found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Add your first employee or load demo data to get started
            </Typography>
            <Button variant="contained" onClick={onLoadDemo} size="large">
              Load Indian Demo Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {employees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        width: 56, 
                        height: 56, 
                        mr: 2,
                        fontSize: '1.2rem'
                      }}
                    >
                      {getInitials(employee.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {employee.name}
                      </Typography>
                      <Chip 
                        label={employee.department} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {employee.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Joined {new Date(employee.joining_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {employee.annual_leave_balance}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Annual Leave
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main">
                        {employee.sick_leave_balance}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sick Leave
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5">Add New Employee</Typography>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="e.g., Arjun Sharma"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                placeholder="e.g., arjun.sharma@symplora.com"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Joining Date"
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} size="large">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" size="large">
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Leave Management Component  
const LeaveManagement = ({ employees, leaveRequests, onSubmitLeave, onApproveReject }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '', leave_type: '', start_date: '', end_date: '', reason: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      await onSubmitLeave(formData);
      setOpen(false);
      setFormData({ employee_id: '', leave_type: '', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit leave request');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Leave Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and manage leave requests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          size="large"
        >
          Submit Leave Request
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <RequestPageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No leave requests found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaveRequests.map((request) => (
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
                      <Chip label={request.leave_type} color="primary" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.start_date} to {request.end_date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {request.days_requested} day{request.days_requested !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={
                          request.status === 'approved' ? 'success' :
                          request.status === 'rejected' ? 'error' :
                          request.status === 'pending' ? 'warning' : 'default'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {request.status === 'pending' && (
                        <Box>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => onApproveReject(request.id, 'approve')}
                              sx={{ mr: 1 }}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => onApproveReject(request.id, 'reject')}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Submit Leave Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Leave Request</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  label="Employee"
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                  label="Leave Type"
                >
                  <MenuItem value="annual">Annual Leave</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="emergency">Emergency Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
                placeholder="Please provide a detailed reason for your leave request..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} size="large">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" size="large">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

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
                {['pending', 'approved', 'rejected'].map(status => {
                  const count = leaveRequests.filter(req => req.status === status).length;
                  const color = status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
                  
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

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load initial data
  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/employees');
      const data = await response.json();
      setEmployees(data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/leave-requests');
      const data = await response.json();
      setLeaveRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
    }
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/quick-setup');
      const data = await response.json();
      setSnackbar({ open: true, message: 'Indian demo data loaded successfully!', severity: 'success' });
      await fetchEmployees();
      await fetchLeaveRequests();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error loading demo data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (employeeData) => {
    console.log('Adding employee:', employeeData);
    const response = await fetch('http://localhost:3001/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add employee');
    }
    
    setSnackbar({ open: true, message: 'Employee added successfully!', severity: 'success' });
    await fetchEmployees();
  };

  const handleSubmitLeave = async (leaveData) => {
    console.log('Submitting leave request:', leaveData);
    const response = await fetch('http://localhost:3001/api/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit leave request');
    }
    
    setSnackbar({ open: true, message: 'Leave request submitted successfully!', severity: 'success' });
    await fetchLeaveRequests();
    await fetchEmployees();
  };

  const handleApproveReject = async (requestId, action) => {
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    const response = await fetch(`http://localhost:3001/api/leave-requests/${requestId}/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        approved_by: 1, 
        comments: `${action}d via system` 
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    setSnackbar({ 
      open: true, 
      message: `Leave request ${action}d successfully!`, 
      severity: action === 'approve' ? 'success' : 'info' 
    });
    await fetchLeaveRequests();
    await fetchEmployees();
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'employees':
        return (
          <EmployeeManagement 
            employees={employees} 
            onAddEmployee={handleAddEmployee}
            onLoadDemo={handleLoadDemo}
          />
        );
      case 'leave-requests':
        return (
          <LeaveManagement 
            employees={employees}
            leaveRequests={leaveRequests}
            onSubmitLeave={handleSubmitLeave}
            onApproveReject={handleApproveReject}
          />
        );
      case 'analytics':
        return <Analytics employees={employees} leaveRequests={leaveRequests} />;
      default:
        return (
          <Dashboard 
            employees={employees} 
            leaveRequests={leaveRequests} 
            onLoadDemo={handleLoadDemo}
          />
        );
    }
  };

  const drawer = (
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
              onClick={() => {
                setCurrentPage(item.path.substring(1));
                if (isMobile) setMobileOpen(false);
              }}
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
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

        {/* Sidebar */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <Toolbar />
          {renderCurrentPage()}
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
