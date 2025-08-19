const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee-postgres');
const { 
  validateEmployee, 
  validateEmployeeId, 
  sanitizeInput 
} = require('../middleware/validation');
const { 
  asyncHandler, 
  BusinessRuleError, 
  NotFoundError 
} = require('../middleware/errorHandler');

/**
 * @route   POST /api/employees
 * @desc    Add a new employee
 * @access  Public (In production, this should be protected)
 */
router.post('/', sanitizeInput, validateEmployee, asyncHandler(async (req, res) => {
  const { name, email, department, joining_date } = req.body;
  console.log('req body',req.body);

  // Check if employee with email already exists
  const existingEmployee = await Employee.findByEmail(email);
  if (existingEmployee) {
    throw new BusinessRuleError('An employee with this email address already exists');
  }

  // Validate joining date
  const dateValidation = Employee.validateJoiningDate(joining_date);
  if (!dateValidation.valid) {
    throw new BusinessRuleError(dateValidation.message);
  }

  // Create new employee
  const newEmployee = await Employee.create({
    name,
    email,
    department,
    joining_date
  });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: newEmployee
  });
}));

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 * @access  Public (In production, this should be protected)
 */
router.get('/', asyncHandler(async (req, res) => {
  const employees = await Employee.findAll();

  res.json({
    success: true,
    message: 'Employees retrieved successfully',
    data: employees,
    count: employees.length
  });
}));

/**
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Public (In production, this should be protected)
 */
router.get('/:id', validateEmployeeId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }

  res.json({
    success: true,
    message: 'Employee retrieved successfully',
    data: employee
  });
}));

/**
 * @route   GET /api/employees/:id/leave-balance
 * @desc    Get employee's current leave balance
 * @access  Public (In production, this should be protected)
 */
router.get('/:id/leave-balance', validateEmployeeId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.getLeaveBalance(id);
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }

  // Calculate leave utilization percentage
  const annualUtilization = ((24 - employee.annual_leave_balance) / 24 * 100).toFixed(1);
  const sickUtilization = ((12 - employee.sick_leave_balance) / 12 * 100).toFixed(1);

  res.json({
    success: true,
    message: 'Leave balance retrieved successfully',
    data: {
      employee_id: employee.id,
      employee_name: employee.name,
      department: employee.department,
      joining_date: employee.joining_date,
      leave_balances: {
        annual: {
          total_entitlement: 24,
          remaining_balance: employee.annual_leave_balance,
          used: 24 - employee.annual_leave_balance,
          utilization_percentage: annualUtilization
        },
        sick: {
          total_entitlement: 12,
          remaining_balance: employee.sick_leave_balance,
          used: 12 - employee.sick_leave_balance,
          utilization_percentage: sickUtilization
        }
      }
    }
  });
}));

/**
 * @route   GET /api/employees/stats/department
 * @desc    Get department-wise employee statistics
 * @access  Public (In production, this should be protected)
 */
router.get('/stats/department', asyncHandler(async (req, res) => {
  const stats = await Employee.getDepartmentStats();

  // Calculate totals
  const totalEmployees = stats.reduce((sum, dept) => sum + dept.total_employees, 0);
  const avgAnnualBalance = stats.length > 0 ? 
    (stats.reduce((sum, dept) => sum + dept.avg_annual_balance, 0) / stats.length).toFixed(1) : 0;
  const avgSickBalance = stats.length > 0 ? 
    (stats.reduce((sum, dept) => sum + dept.avg_sick_balance, 0) / stats.length).toFixed(1) : 0;

  res.json({
    success: true,
    message: 'Department statistics retrieved successfully',
    data: {
      department_breakdown: stats.map(dept => ({
        ...dept,
        avg_annual_balance: Number(dept.avg_annual_balance.toFixed(1)),
        avg_sick_balance: Number(dept.avg_sick_balance.toFixed(1))
      })),
      summary: {
        total_employees: totalEmployees,
        total_departments: stats.length,
        company_avg_annual_balance: Number(avgAnnualBalance),
        company_avg_sick_balance: Number(avgSickBalance)
      }
    }
  });
}));

/**
 * @route   PUT /api/employees/:id/leave-balance
 * @desc    Update employee's leave balance (admin function)
 * @access  Public (In production, this should be admin-only)
 */
router.put('/:id/leave-balance', validateEmployeeId, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { leave_type, days, operation = 'subtract', reason } = req.body;

  // Validate input
  if (!['annual', 'sick'].includes(leave_type)) {
    throw new BusinessRuleError('Leave type must be either "annual" or "sick"');
  }

  if (!['add', 'subtract'].includes(operation)) {
    throw new BusinessRuleError('Operation must be either "add" or "subtract"');
  }

  if (!days || days <= 0) {
    throw new BusinessRuleError('Days must be a positive number');
  }

  if (!reason || reason.trim().length < 5) {
    throw new BusinessRuleError('Reason is required and must be at least 5 characters');
  }

  // Check if employee exists
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }

  // Check if operation would result in negative balance
  if (operation === 'subtract') {
    const currentBalance = leave_type === 'annual' ? 
      employee.annual_leave_balance : employee.sick_leave_balance;
    
    if (currentBalance < days) {
      throw new BusinessRuleError(
        `Insufficient ${leave_type} leave balance. Current balance: ${currentBalance} days`
      );
    }
  }

  // Update balance
  await Employee.updateLeaveBalance(id, leave_type, days, operation);

  // Get updated employee data
  const updatedEmployee = await Employee.getLeaveBalance(id);

  res.json({
    success: true,
    message: `Leave balance ${operation}ed successfully`,
    data: {
      employee_id: updatedEmployee.id,
      employee_name: updatedEmployee.name,
      operation_details: {
        leave_type,
        days,
        operation,
        reason
      },
      updated_balances: {
        annual_leave_balance: updatedEmployee.annual_leave_balance,
        sick_leave_balance: updatedEmployee.sick_leave_balance
      }
    }
  });
}));

module.exports = router;
