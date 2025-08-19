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
const { 
  asyncHandler, 
  BusinessRuleError, 
  NotFoundError 
} = require('../middleware/errorHandler');

/**
 * @route   POST /api/leave-requests
 * @desc    Apply for leave
 * @access  Public (In production, this should be protected)
 */
router.post('/', 
  sanitizeInput, 
  validateLeaveRequest, 
  validateDateRange,
  validateBusinessDays,
  asyncHandler(async (req, res) => {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Validate leave request business rules
    const validation = LeaveRequest.validateLeaveRequest(
      employee_id, leave_type, start_date, end_date, reason
    );

    if (!validation.valid) {
      throw new BusinessRuleError(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for overlapping requests
    const overlappingRequests = await LeaveRequest.checkOverlappingRequests(
      employee_id, start_date, end_date
    );

    if (overlappingRequests.length > 0) {
      throw new BusinessRuleError(
        'You have overlapping leave requests for this period. Please check your existing requests.'
      );
    }

    // Check if employee has sufficient leave balance
    const balanceField = leave_type === 'annual' ? 'annual_leave_balance' : 'sick_leave_balance';
    const currentBalance = employee[balanceField];

    if (currentBalance < validation.workingDays) {
      throw new BusinessRuleError(
        `Insufficient ${leave_type} leave balance. Required: ${validation.workingDays} days, Available: ${currentBalance} days`
      );
    }

    // Check if employee is applying for leave before joining date
    const joiningDate = new Date(employee.joining_date);
    const leaveStartDate = new Date(start_date);

    if (leaveStartDate < joiningDate) {
      throw new BusinessRuleError('Cannot apply for leave before joining date');
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason
    });

    // Get complete leave request data with employee info
    const completeRequest = await LeaveRequest.findById(leaveRequest.id);

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: {
        ...completeRequest,
        working_days_requested: validation.workingDays
      }
    });
  })
);

/**
 * @route   GET /api/leave-requests
 * @desc    Get all leave requests with optional filters
 * @access  Public (In production, this should be protected)
 */
router.get('/', 
  validateLeaveQuery,
  asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      department: req.query.department,
      leave_type: req.query.leave_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const leaveRequests = await LeaveRequest.findAll(filters);

    res.json({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: leaveRequests,
      count: leaveRequests.length,
      filters_applied: filters
    });
  })
);

/**
 * @route   GET /api/leave-requests/:id
 * @desc    Get leave request by ID
 * @access  Public (In production, this should be protected)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new BusinessRuleError('Invalid leave request ID');
  }

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    throw new NotFoundError('Leave request not found');
  }

  res.json({
    success: true,
    message: 'Leave request retrieved successfully',
    data: leaveRequest
  });
}));

/**
 * @route   GET /api/leave-requests/employee/:employee_id
 * @desc    Get leave requests for a specific employee
 * @access  Public (In production, this should be protected)
 */
router.get('/employee/:employee_id', asyncHandler(async (req, res) => {
  const { employee_id } = req.params;
  const { status } = req.query;

  if (!employee_id || isNaN(employee_id)) {
    throw new BusinessRuleError('Invalid employee ID');
  }

  // Check if employee exists
  const employee = await Employee.findById(employee_id);
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }

  const leaveRequests = await LeaveRequest.findByEmployeeId(employee_id, status);

  res.json({
    success: true,
    message: 'Employee leave requests retrieved successfully',
    data: {
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department
      },
      leave_requests: leaveRequests,
      count: leaveRequests.length
    }
  });
}));

/**
 * @route   PUT /api/leave-requests/:id/approve
 * @desc    Approve a leave request
 * @access  Public (In production, this should be protected)
 */
router.put('/:id/approve', 
  validateLeaveDecision,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved_by, comments } = req.body;

    // Get leave request details
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request not found');
    }

    // Check if request is still pending
    if (leaveRequest.status !== 'pending') {
      throw new BusinessRuleError(`Cannot approve a ${leaveRequest.status} leave request`);
    }

    // Check if approver exists
    const approver = await Employee.findById(approved_by);
    if (!approver) {
      throw new NotFoundError('Approver not found');
    }

    // Re-check employee balance before approval (race condition protection)
    const employee = await Employee.findById(leaveRequest.employee_id);
    const balanceField = leaveRequest.leave_type === 'annual' ? 'annual_leave_balance' : 'sick_leave_balance';
    const currentBalance = employee[balanceField];

    if (currentBalance < leaveRequest.days_requested) {
      throw new BusinessRuleError(
        `Cannot approve: Insufficient ${leaveRequest.leave_type} leave balance. Required: ${leaveRequest.days_requested} days, Available: ${currentBalance} days`
      );
    }

    // Update leave request status
    await LeaveRequest.updateStatus(id, 'approved', approved_by, comments);

    // Deduct leave balance
    await Employee.updateLeaveBalance(
      leaveRequest.employee_id, 
      leaveRequest.leave_type, 
      leaveRequest.days_requested, 
      'subtract'
    );

    // Get updated leave request
    const updatedRequest = await LeaveRequest.findById(id);

    res.json({
      success: true,
      message: 'Leave request approved successfully',
      data: updatedRequest
    });
  })
);

/**
 * @route   PUT /api/leave-requests/:id/reject
 * @desc    Reject a leave request
 * @access  Public (In production, this should be protected)
 */
router.put('/:id/reject', 
  validateLeaveDecision,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved_by, comments } = req.body;

    // Get leave request details
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      throw new NotFoundError('Leave request not found');
    }

    // Check if request is still pending
    if (leaveRequest.status !== 'pending') {
      throw new BusinessRuleError(`Cannot reject a ${leaveRequest.status} leave request`);
    }

    // Check if approver exists
    const approver = await Employee.findById(approved_by);
    if (!approver) {
      throw new NotFoundError('Approver not found');
    }

    // Require comments for rejection
    if (!comments || comments.trim().length < 10) {
      throw new BusinessRuleError('Comments are required for rejection and must be at least 10 characters long');
    }

    // Update leave request status
    await LeaveRequest.updateStatus(id, 'rejected', approved_by, comments);

    // Get updated leave request
    const updatedRequest = await LeaveRequest.findById(id);

    res.json({
      success: true,
      message: 'Leave request rejected successfully',
      data: updatedRequest
    });
  })
);

/**
 * @route   GET /api/leave-requests/stats/overview
 * @desc    Get leave statistics overview
 * @access  Public (In production, this should be protected)
 */
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const { year } = req.query;
  const targetYear = year ? parseInt(year) : new Date().getFullYear();

  const [stats, pendingCount, upcomingLeaves] = await Promise.all([
    LeaveRequest.getLeaveStats(targetYear),
    LeaveRequest.getPendingRequestsCount(),
    LeaveRequest.getUpcomingLeaves(14) // Next 14 days
  ]);

  // Process stats into a more readable format
  const departmentStats = {};
  const leaveTypeStats = { annual: 0, sick: 0, emergency: 0 };
  const statusStats = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };

  stats.forEach(stat => {
    // Department stats
    if (!departmentStats[stat.department]) {
      departmentStats[stat.department] = {
        department: stat.department,
        total_requests: 0,
        total_days: 0,
        by_type: { annual: 0, sick: 0, emergency: 0 },
        by_status: { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
      };
    }

    departmentStats[stat.department].total_requests += stat.request_count;
    departmentStats[stat.department].total_days += stat.total_days;
    departmentStats[stat.department].by_type[stat.leave_type] += stat.request_count;
    departmentStats[stat.department].by_status[stat.status] += stat.request_count;

    // Overall stats
    leaveTypeStats[stat.leave_type] += stat.request_count;
    statusStats[stat.status] += stat.request_count;
  });

  res.json({
    success: true,
    message: 'Leave statistics retrieved successfully',
    data: {
      year: targetYear,
      overview: {
        total_requests: Object.values(statusStats).reduce((a, b) => a + b, 0),
        pending_requests: pendingCount,
        upcoming_leaves_count: upcomingLeaves.length,
        leave_type_breakdown: leaveTypeStats,
        status_breakdown: statusStats
      },
      department_breakdown: Object.values(departmentStats),
      upcoming_leaves: upcomingLeaves.slice(0, 10) // Limit to 10 most recent
    }
  });
}));

/**
 * @route   PUT /api/leave-requests/:id/cancel
 * @desc    Cancel a leave request (employee self-service)
 * @access  Public (In production, this should be protected)
 */
router.put('/:id/cancel', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { employee_id, reason } = req.body;

  // Get leave request details
  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    throw new NotFoundError('Leave request not found');
  }

  // Check if the employee owns this request
  if (leaveRequest.employee_id !== parseInt(employee_id)) {
    throw new BusinessRuleError('You can only cancel your own leave requests');
  }

  // Check if request can be cancelled
  if (!['pending', 'approved'].includes(leaveRequest.status)) {
    throw new BusinessRuleError(`Cannot cancel a ${leaveRequest.status} leave request`);
  }

  // Check if leave has already started
  const today = new Date();
  const leaveStartDate = new Date(leaveRequest.start_date);
  
  if (leaveStartDate <= today) {
    throw new BusinessRuleError('Cannot cancel leave that has already started');
  }

  // If approved leave is being cancelled, restore the balance
  if (leaveRequest.status === 'approved') {
    await Employee.updateLeaveBalance(
      leaveRequest.employee_id,
      leaveRequest.leave_type,
      leaveRequest.days_requested,
      'add'
    );
  }

  // Update status to cancelled
  await LeaveRequest.updateStatus(id, 'cancelled', employee_id, reason || 'Cancelled by employee');

  // Get updated leave request
  const updatedRequest = await LeaveRequest.findById(id);

  res.json({
    success: true,
    message: 'Leave request cancelled successfully',
    data: updatedRequest
  });
}));

module.exports = router;
