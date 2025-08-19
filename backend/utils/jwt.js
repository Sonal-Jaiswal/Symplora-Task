// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// if (!JWT_SECRET) {
//   console.error('❌ ERROR: JWT_SECRET environment variable is not set');
//   console.error('Please add JWT_SECRET to your config.env file');
//   process.exit(1);
// }

// /**
//  * Generate JWT token for user authentication
//  * @param {Object} payload - User data to include in token
//  * @returns {String} JWT token
//  */
// const generateToken = (payload) => {
//   try {
//     return jwt.sign(payload, JWT_SECRET, {
//       expiresIn: JWT_EXPIRES_IN,
//       issuer: 'symplora-lms',
//       audience: 'symplora-users'
//     });
//   } catch (error) {
//     throw new Error('Error generating JWT token: ' + error.message);
//   }
// };

// /**
//  * Verify and decode JWT token
//  * @param {String} token - JWT token to verify
//  * @returns {Object} Decoded token payload
//  */
// const verifyToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_SECRET, {
//       issuer: 'symplora-lms',
//       audience: 'symplora-users'
//     });
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       throw new Error('Token has expired');
//     } else if (error.name === 'JsonWebTokenError') {
//       throw new Error('Invalid token');
//     } else {
//       throw new Error('Token verification failed: ' + error.message);
//     }
//   }
// };

// /**
//  * Generate a refresh token (longer expiry)
//  * @param {Object} payload - User data to include in token
//  * @returns {String} Refresh token
//  */
// const generateRefreshToken = (payload) => {
//   try {
//     return jwt.sign(payload, JWT_SECRET, {
//       expiresIn: '7d', // Refresh token expires in 7 days
//       issuer: 'symplora-lms',
//       audience: 'symplora-refresh'
//     });
//   } catch (error) {
//     throw new Error('Error generating refresh token: ' + error.message);
//   }
// };

// /**
//  * Verify refresh token
//  * @param {String} token - Refresh token to verify
//  * @returns {Object} Decoded token payload
//  */
// const verifyRefreshToken = (token) => {
//   try {
//     return jwt.verify(token, JWT_SECRET, {
//       issuer: 'symplora-lms',
//       audience: 'symplora-refresh'
//     });
//   } catch (error) {
//     throw new Error('Invalid refresh token');
//   }
// };

// /**
//  * Extract token from Authorization header
//  * @param {String} authHeader - Authorization header value
//  * @returns {String|null} Token or null if not found
//  */
// const extractTokenFromHeader = (authHeader) => {
//   if (authHeader && authHeader.startsWith('Bearer ')) {
//     return authHeader.substring(7); // Remove 'Bearer ' prefix
//   }
//   return null;
// };

// /**
//  * Generate a secure random JWT secret
//  * @returns {String} Random secret key
//  */
// const generateSecretKey = () => {
//   const crypto = require('crypto');
//   return crypto.randomBytes(64).toString('hex');
// };

// module.exports = {
//   generateToken,
//   verifyToken,
//   generateRefreshToken,
//   verifyRefreshToken,
//   extractTokenFromHeader,
//   generateSecretKey
// };
