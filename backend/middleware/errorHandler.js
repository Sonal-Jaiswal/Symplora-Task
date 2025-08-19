// Global error handling middleware

const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Default error response
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error.message = 'A record with this information already exists';
    error.type = 'DUPLICATE_ENTRY';
    return res.status(409).json(error);
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    error.message = 'Referenced record does not exist';
    error.type = 'FOREIGN_KEY_VIOLATION';
    return res.status(400).json(error);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.errors = err.errors;
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.type = 'INVALID_TOKEN';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.type = 'TOKEN_EXPIRED';
    return res.status(401).json(error);
  }

  // Custom business logic errors
  if (err.type === 'BUSINESS_RULE_VIOLATION') {
    return res.status(422).json(error);
  }

  if (err.type === 'NOT_FOUND') {
    return res.status(404).json(error);
  }

  if (err.type === 'UNAUTHORIZED') {
    return res.status(403).json(error);
  }

  // Catch-all for unexpected errors
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
    ...(process.env.NODE_ENV === 'development' && { 
      originalMessage: err.message,
      stack: err.stack 
    })
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.type = 'NOT_FOUND';
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error classes
class BusinessRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
    this.type = 'BUSINESS_RULE_VIOLATION';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.type = 'NOT_FOUND';
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.type = 'UNAUTHORIZED';
  }
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`);
  
  // Log response time when request completes
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };
  
  next();
};

// Rate limiting simulation (for production, use express-rate-limit)
const rateLimiter = (req, res, next) => {
  // Simple in-memory rate limiting (for demo purposes)
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // max requests per window
  
  if (!rateLimiter.requests) {
    rateLimiter.requests = new Map();
  }
  
  const userRequests = rateLimiter.requests.get(ip) || [];
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
  
  recentRequests.push(now);
  rateLimiter.requests.set(ip, recentRequests);
  
  next();
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  BusinessRuleError,
  NotFoundError,
  UnauthorizedError,
  requestLogger,
  rateLimiter
};
