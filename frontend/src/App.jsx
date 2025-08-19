import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  Drawer,
  Snackbar,
  Alert,
  useMediaQuery
} from '@mui/material';

// Import theme and components
import { theme, drawerWidth } from './theme';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeManagement from './components/EmployeeManagement/EmployeeManagement';
import LeaveManagement from './components/LeaveManagement/LeaveManagement';
import Analytics from './components/Analytics/Analytics';
import { Sidebar, Header } from './components/Layout';

// Navigation items
const navigationItems = [
  { text: 'Dashboard', icon: null, path: '/dashboard' },
  { text: 'Employees', icon: null, path: '/employees' },
  { text: 'Leave Requests', icon: null, path: '/leave-requests' },
  { text: 'Analytics', icon: null, path: '/analytics' },
];

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
    const response = await fetch(`http://localhost:3001/api/leave-requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: action === 'approve' ? 'Approved' : 'Rejected',
        comment: `${action}d via system`
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Header */}
        <Header 
          currentPage={currentPage}
          setMobileOpen={setMobileOpen}
          mobileOpen={mobileOpen}
          handleLoadDemo={handleLoadDemo}
          loading={loading}
          navigationItems={navigationItems}
        />

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
            <Sidebar 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isMobile={isMobile}
              setMobileOpen={setMobileOpen}
            />
          </Drawer>
          
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            <Sidebar 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isMobile={isMobile}
              setMobileOpen={setMobileOpen}
            />
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
          <Box sx={{ height: 64 }} /> {/* Toolbar spacer */}
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
