/**
 * Error Handler Utility
 * Centralized error handling to reduce code duplication across controllers
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

/**
 * Wrap controller actions with consistent error handling
 * @param {Function} controller - Controller function to wrap
 * @return {Function} Wrapped async function with error handling
 */
const withErrorHandler = (controller) => async (req, res, next) => {
  try {
    return await controller(req, res, next);
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Send error response with consistent format
 */
const sendError = (res, statusCode, message, error = null) => {
  console.error(message, error);
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error && { error: error.message }),
  });
};

/**
 * Send success response with consistent format
 */
const sendSuccess = (res, data, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Send validation error
 */
const sendValidationError = (res, field, message) => {
  return sendError(res, HTTP_STATUS.BAD_REQUEST, `${field}: ${message}`);
};

module.exports = {
  withErrorHandler,
  sendError,
  sendSuccess,
  sendValidationError,
};
