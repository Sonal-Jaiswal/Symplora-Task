const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest-postgres');
const Employee = require('../models/Employee-postgres');
const { 
  validateLeaveRequest, 
  validateLeaveDecision,
  validateLeaveQuery,
  validateDateRange,
  validateBusinessDays,
  sanitizeInput 
} = require('../middleware/validation');

// Apply for leave
router.post('/', [validateLeaveRequest], async (req, res) => {
  try {
    console.log('Leave Request Body:', req.body); // Add this line for debugging
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee not found',
        error_details: { field: 'employee_id', message: 'Employee does not exist' }
      });
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    console.error('Leave Request Error:', error); // Add this line for debugging
    res.status(400).json({
      success: false,
      message: error.message,
      error_details: error.details || error.message
    });
  }
});

// Get all leave requests
router.get('/', [validateLeaveQuery], async (req, res) => {
  try {
    const { status } = req.query;
    const leaveRequests = await LeaveRequest.findAll(status);
    
    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error_details: error.details || error.message
    });
  }
});

// Get leave request by ID
router.get('/:id', async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    res.json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error_details: error.details || error.message
    });
  }
});

// Update leave request status (Approve/Reject)
router.patch('/:id/status', [validateLeaveDecision], async (req, res) => {
  try {
    const { status, comment } = req.body;
    const leaveRequest = await LeaveRequest.updateStatus(req.params.id, status, comment);
    
    res.json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error_details: error.details || error.message
    });
  }
});

module.exports = router;