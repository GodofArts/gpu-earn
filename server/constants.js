/**
 * Application Constants
 * Centralized enums and magic strings to prevent typos and enable type safety
 */

// Subscription Types
const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  PRO_MONTHLY: 'pro_monthly',
  PRO_YEARLY: 'pro_yearly',
};

// Subscription Status
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  EXPIRED: 'expired',
};

// Payment Methods
const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  YOOKASSA: 'yookassa',
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Platform Categories
const PLATFORM_CATEGORIES = {
  MINERS: 'miners',
  SINGLE_PC: 'single_pc',
  BUSINESS: 'business',
  DECENTRALIZED: 'decentralized',
  PASSIVE: 'passive',
};

// Platform Earning Types
const EARNING_TYPES = {
  PAY_PER_HOUR: 'Pay-per-Hour',
  INFERENCE: 'Inference',
  DEPIN: 'DePIN',
};

// User Types (for platform recommendations)
const USER_TYPES = {
  BEGINNER: 'beginner',
  ADVANCED: 'advanced',
  DECENTRALIZED: 'decentralized',
  PASSIVE: 'passive',
  BUSINESS: 'business',
};

// HTTP Status Codes (for consistency)
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Error Messages
const ERROR_MESSAGES = {
  GUIDE_NOT_FOUND: 'Guide not found',
  USER_NOT_FOUND: 'User not found',
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  PLATFORM_NOT_FOUND: 'Platform not found',
  PURCHASE_NOT_FOUND: 'Purchase not found',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_TOKEN: 'Invalid or expired token',
  NO_ACCESS: 'You do not have access to this guide',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
  PAYMENT_FAILED: 'Payment processing failed',
  INVALID_INPUT: 'Invalid input data',
  SERVER_ERROR: 'Internal server error',
};

// Access Duration (in days)
const ACCESS_DURATION = {
  GUIDE_PURCHASE: 90,
  SUBSCRIPTION_MONTHLY: 30,
  SUBSCRIPTION_YEARLY: 365,
};

module.exports = {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PLATFORM_CATEGORIES,
  EARNING_TYPES,
  USER_TYPES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  ACCESS_DURATION,
};
