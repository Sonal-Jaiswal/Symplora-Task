const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Employee validation rules
const validateEmployee = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('department')
    .trim()
    .isIn(['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'])
    .withMessage('Department must be one of: Engineering, HR, Finance, Marketing, Sales, Operations'),
  
  body('joining_date')
    .isISO8601()
    .withMessage('Joining date must be a valid date in YYYY-MM-DD format')
    .custom((value) => {
      const joiningDate = new Date(value);
      const today = new Date();
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(today.getFullYear() - 10);
      
      if (joiningDate > today) {
        throw new Error('Joining date cannot be in the future');
      }
      
      if (joiningDate < tenYearsAgo) {
        throw new Error('Joining date cannot be more than 10 years ago');
      }
      
      return true;
    }),
  
  handleValidationErrors
];

// Leave request validation rules
const validateLeaveRequest = [
  body('employee_id')
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer'),
  
  body('leave_type')
    .isIn(['annual', 'sick', 'emergency'])
    .withMessage('Leave type must be one of: annual, sick, emergency'),
  
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date in YYYY-MM-DD format')
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      
      return true;
    }),
  
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date in YYYY-MM-DD format')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.start_date);
      
      if (endDate < startDate) {
        throw new Error('End date must be after or equal to start date');
      }
      
      // Maximum 30 working days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff > 30) {
        throw new Error('Leave duration cannot exceed 30 days');
      }
      
      return true;
    }),
  
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  
  handleValidationErrors
];

// Leave approval/rejection validation
const validateLeaveDecision = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Leave request ID must be a positive integer'),
  
  body('approved_by')
    .isInt({ min: 1 })
    .withMessage('Approver ID must be a positive integer'),
  
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Employee ID parameter validation
const validateEmployeeId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer'),
  
  handleValidationErrors
];

// Query parameter validation for leave requests
const validateLeaveQuery = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'cancelled'])
    .withMessage('Status must be one of: pending, approved, rejected, cancelled'),
  
  query('department')
    .optional()
    .isIn(['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'])
    .withMessage('Department must be one of: Engineering, HR, Finance, Marketing, Sales, Operations'),
  
  query('leave_type')
    .optional()
    .isIn(['annual', 'sick', 'emergency'])
    .withMessage('Leave type must be one of: annual, sick, emergency'),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in YYYY-MM-DD format'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date in YYYY-MM-DD format'),
  
  handleValidationErrors
];

// Date range validation
const validateDateRange = (req, res, next) => {
  const { start_date, end_date } = req.body || req.query;
  
  if (start_date && end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before or equal to end date'
      });
    }
  }
  
  next();
};

// Business day validation (no weekends)
const validateBusinessDays = (req, res, next) => {
  const { start_date, end_date } = req.body;
  
  if (start_date && end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    // Check if it's weekend-only leave
    let hasWorkingDay = false;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        hasWorkingDay = true;
        break;
      }
      current.setDate(current.getDate() + 1);
    }
    
    if (!hasWorkingDay) {
      return res.status(400).json({
        success: false,
        message: 'Leave request must include at least one working day'
      });
    }
  }
  
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potentially harmful characters
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
    }
    return str;
  };

  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeString(req.body[key]);
    });
  }

  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeString(req.query[key]);
    });
  }

  next();
};

module.exports = {
  validateEmployee,
  validateLeaveRequest,
  validateLeaveDecision,
  validateEmployeeId,
  validateLeaveQuery,
  validateDateRange,
  validateBusinessDays,
  sanitizeInput,
  handleValidationErrors
};
