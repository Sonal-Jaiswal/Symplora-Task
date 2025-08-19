const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'UNAUTHORIZED'
      });
    }

    // Verify the token
    const decoded = verifyToken(token);
    
    // Add user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
      error: 'UNAUTHORIZED'
    });
  }
};

/**
 * Middleware to check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'UNAUTHORIZED'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'hr') {
    return res.status(403).json({
      success: false,
      message: 'Admin or HR privileges required',
      error: 'FORBIDDEN'
    });
  }

  next();
};

/**
 * Middleware to check if user has HR role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireHR = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'UNAUTHORIZED'
    });
  }

  if (req.user.role !== 'hr' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'HR or Admin privileges required',
      error: 'FORBIDDEN'
    });
  }

  next();
};

/**
 * Middleware to check if user can access employee data
 * Either the user themselves, their manager, or HR/Admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const canAccessEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'UNAUTHORIZED'
    });
  }

  const requestedEmployeeId = parseInt(req.params.id || req.body.employee_id);
  const currentUserId = req.user.id;
  const userRole = req.user.role;

  // Admin and HR can access all employee data
  if (userRole === 'admin' || userRole === 'hr') {
    return next();
  }

  // Regular employees can only access their own data
  if (currentUserId === requestedEmployeeId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You can only access your own employee data',
    error: 'FORBIDDEN'
  });
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireHR,
  canAccessEmployee,
  optionalAuth
};
