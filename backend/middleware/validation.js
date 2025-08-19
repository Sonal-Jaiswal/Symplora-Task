const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', errors.array()); // Add this line for debugging
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        value: err.value,
        message: err.msg
      }))
    });
  }
  next();
};

// Employee validation rules
const validateEmployee = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Name is required'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('department')
    .trim()
    .isIn(['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'])
    .withMessage('Department must be one of: Engineering, HR, Finance, Marketing, Sales, Operations'),
  
  body('joining_date')
    .notEmpty()
    .withMessage('Joining date is required'),
  
  handleValidationErrors
];

// Employee ID validation
const validateEmployeeId = [
  param('id')
    .isInt()
    .withMessage('Employee ID must be a number'),
  handleValidationErrors
];

// Leave request validation rules
const validateLeaveRequest = [
  body('employee_id')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isInt()
    .withMessage('Employee ID must be a number'),
  
  body('leave_type')
    .trim()
    .notEmpty()
    .withMessage('Leave type is required')
    .isIn(['Annual', 'Sick', 'Unpaid'])
    .withMessage('Leave type must be one of: Annual, Sick, Unpaid'),
  
  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/)
    .withMessage('Start date must be in DD/MM/YYYY format'),
  
  body('end_date')
    .notEmpty()
    .withMessage('End date is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/)
    .withMessage('End date must be in DD/MM/YYYY format'),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 3 })
    .withMessage('Reason must be at least 3 characters long'),
  
  handleValidationErrors
];

// Leave decision validation rules
const validateLeaveDecision = [
  body('status')
    .trim()
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be either Approved or Rejected'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Query validation rules
const validateLeaveQuery = [
  query('status')
    .optional()
    .trim()
    .isIn(['Pending', 'Approved', 'Rejected'])
    .withMessage('Status must be one of: Pending, Approved, Rejected'),
  
  handleValidationErrors
];

// Date range validation
const validateDateRange = (req, res, next) => {
  next();
};

// Business days validation
const validateBusinessDays = (req, res, next) => {
  next();
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

module.exports = {
  validateEmployee,
  validateEmployeeId,
  validateLeaveRequest,
  validateLeaveDecision,
  validateLeaveQuery,
  validateDateRange,
  validateBusinessDays,
  sanitizeInput,
  handleValidationErrors
};