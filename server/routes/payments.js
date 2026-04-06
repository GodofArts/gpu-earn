/**
 * Payment Routes
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

/**
 * Webhook routes (raw body required for signature verification)
 * These should be set up to receive raw body, not parsed JSON
 */
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);
router.post('/yookassa/webhook', express.raw({ type: 'application/json' }), paymentController.handleYooKassaWebhook);

// Protected routes
router.get('/status/:paymentId', authMiddleware, paymentController.getPaymentStatus);

module.exports = router;
