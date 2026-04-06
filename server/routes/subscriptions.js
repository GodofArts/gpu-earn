/**
 * Subscription Routes
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Protected routes (require authentication)
router.get('/', authMiddleware, subscriptionController.getCurrentSubscription);
router.post('/upgrade', authMiddleware, subscriptionController.upgradeSubscription);
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription);

module.exports = router;
