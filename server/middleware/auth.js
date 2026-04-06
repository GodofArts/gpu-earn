/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */

const authService = require('../services/authService');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Optional auth middleware (doesn't fail if token is missing)
 */
const optionalAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = authService.verifyAccessToken(token);
      req.user = decoded;
    } catch (err) {
      // Token is invalid, but we don't fail - user is just not authenticated
    }
  }

  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
