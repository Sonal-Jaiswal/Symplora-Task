import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
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
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  RequestPage as RequestPageIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Helper function to format date to DD/MM/YYYY
const formatDate = (date) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const LeaveManagement = ({ employees, leaveRequests, onSubmitLeave, onApproveReject }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '', leave_type: '', start_date: '', end_date: '', reason: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      // Format dates to DD/MM/YYYY and capitalize leave type
      const formattedData = {
        ...formData,
        leave_type: formData.leave_type === 'annual' ? 'Annual' : 
                   formData.leave_type === 'sick' ? 'Sick' : 'Unpaid',
        start_date: formatDate(formData.start_date),
        end_date: formatDate(formData.end_date)
      };
      await onSubmitLeave(formattedData);
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
                          request.status === 'Approved' ? 'success' :
                          request.status === 'Rejected' ? 'error' :
                          request.status === 'Pending' ? 'warning' : 'default'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {request.status?.toLowerCase() === 'pending' && (
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
                  <MenuItem value="unpaid">Unpaid Leave</MenuItem>
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

export default LeaveManagement;
