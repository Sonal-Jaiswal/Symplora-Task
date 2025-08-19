import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Grid,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { useAppContext } from '../../context/AppContext';

const AddLeaveRequestDialog = ({ open, onClose }) => {
  const { actions, loading, employees } = useAppContext();
  
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: '',
    start_date: dayjs().add(1, 'day'),
    end_date: dayjs().add(1, 'day'),
    reason: '',
  });
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [workingDays, setWorkingDays] = useState(0);

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', description: 'Planned vacation/personal time' },
    { value: 'sick', label: 'Sick Leave', description: 'Medical leave/illness' },
    { value: 'emergency', label: 'Emergency Leave', description: 'Urgent family matters' },
  ];

  // Calculate working days whenever dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date && 
        formData.start_date.isValid() && formData.end_date.isValid() &&
        formData.end_date.isSameOrAfter(formData.start_date)) {
      
      const days = calculateWorkingDays(formData.start_date, formData.end_date);
      setWorkingDays(days);
    } else {
      setWorkingDays(0);
    }
  }, [formData.start_date, formData.end_date]);

  const calculateWorkingDays = (startDate, endDate) => {
    let count = 0;
    const current = startDate.clone();
    
    while (current.isSameOrBefore(endDate, 'day')) {
      const dayOfWeek = current.day();
      // Monday = 1, Friday = 5 (excluding weekends)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.add(1, 'day');
    }
    
    return count;
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee validation
    if (!formData.employee_id) {
      newErrors.employee_id = 'Please select an employee';
    }

    // Leave type validation
    if (!formData.leave_type) {
      newErrors.leave_type = 'Please select a leave type';
    }

    // Start date validation
    if (!formData.start_date || !formData.start_date.isValid()) {
      newErrors.start_date = 'Valid start date is required';
    } else if (formData.start_date.isBefore(dayjs(), 'day')) {
      newErrors.start_date = 'Start date cannot be in the past';
    }

    // End date validation
    if (!formData.end_date || !formData.end_date.isValid()) {
      newErrors.end_date = 'Valid end date is required';
    } else if (formData.end_date.isBefore(formData.start_date, 'day')) {
      newErrors.end_date = 'End date must be after or equal to start date';
    }

    // Reason validation
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.trim().length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters long';
    } else if (formData.reason.trim().length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
    }

    // Business rules validation
    if (workingDays > 30) {
      newErrors.duration = 'Leave duration cannot exceed 30 working days';
    } else if (workingDays < 1) {
      newErrors.duration = 'Leave must include at least 1 working day';
    }

    // Notice period validation for annual leave
    if (formData.leave_type === 'annual' && formData.start_date.isValid()) {
      const minNoticeDate = dayjs().add(3, 'days');
      if (formData.start_date.isBefore(minNoticeDate, 'day')) {
        newErrors.notice = 'Annual leave requires at least 3 days notice';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmployeeChange = (event, newValue) => {
    const employeeId = newValue ? newValue.id : '';
    setFormData(prev => ({
      ...prev,
      employee_id: employeeId
    }));
    setSelectedEmployee(newValue);
    
    if (errors.employee_id) {
      setErrors(prev => ({
        ...prev,
        employee_id: ''
      }));
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      const leaveData = {
        employee_id: formData.employee_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date.format('YYYY-MM-DD'),
        end_date: formData.end_date.format('YYYY-MM-DD'),
        reason: formData.reason.trim(),
      };

      await actions.createLeaveRequest(leaveData);
      handleClose();
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleClose = () => {
    setFormData({
      employee_id: '',
      leave_type: '',
      start_date: dayjs().add(1, 'day'),
      end_date: dayjs().add(1, 'day'),
      reason: '',
    });
    setSelectedEmployee(null);
    setErrors({});
    setSubmitError('');
    setWorkingDays(0);
    onClose();
  };

  const getLeaveTypeInfo = () => {
    const selectedType = leaveTypes.find(type => type.value === formData.leave_type);
    return selectedType ? selectedType.description : '';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
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
          Submit Leave Request
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Submit a leave application on behalf of an employee
          </Typography>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {(errors.duration || errors.notice) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.duration || errors.notice}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Employee Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.name} (${option.department})`}
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Employee"
                    error={!!errors.employee_id}
                    helperText={errors.employee_id}
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email} • {option.department}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Leave Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.leave_type} required>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={formData.leave_type}
                  onChange={handleChange('leave_type')}
                  label="Leave Type"
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.leave_type && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.leave_type}
                  </Typography>
                )}
              </FormControl>
              {formData.leave_type && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {getLeaveTypeInfo()}
                </Typography>
              )}
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={handleDateChange('start_date')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.start_date,
                    helperText: errors.start_date,
                    required: true,
                  }
                }}
                minDate={dayjs()}
                maxDate={dayjs().add(1, 'year')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={handleDateChange('end_date')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.end_date,
                    helperText: errors.end_date,
                    required: true,
                  }
                }}
                minDate={formData.start_date || dayjs()}
                maxDate={dayjs().add(1, 'year')}
              />
            </Grid>

            {/* Duration Info */}
            {workingDays > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: 'primary.50', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="primary" fontSize="small" />
                  <Typography variant="body2" color="primary.dark">
                    <strong>Duration:</strong> {workingDays} working day{workingDays !== 1 ? 's' : ''} 
                    {workingDays > 5 && ' (excluding weekends)'}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Reason */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Leave"
                multiline
                rows={3}
                value={formData.reason}
                onChange={handleChange('reason')}
                error={!!errors.reason}
                helperText={errors.reason || `${formData.reason.length}/500 characters`}
                placeholder="Please provide a detailed reason for the leave request..."
                required
              />
            </Grid>
          </Grid>

          {/* Employee Balance Info */}
          {selectedEmployee && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="info.dark" gutterBottom>
                Current Leave Balance for {selectedEmployee.name}:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Annual: ${selectedEmployee.annual_leave_balance || 0} days`}
                  color={selectedEmployee.annual_leave_balance > 0 ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={`Sick: ${selectedEmployee.sick_leave_balance || 0} days`}
                  color={selectedEmployee.sick_leave_balance > 0 ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleClose} 
            color="inherit"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || workingDays === 0}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddLeaveRequestDialog;
