/**
 * Guide Routes
 */

const express = require('express');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const guideController = require('../controllers/guideController');

const router = express.Router();

// Public routes
router.get('/', guideController.getAllGuides);
router.get('/free/:slug', guideController.getFreeGuide);  // Free Markdown guides (must be before /:id)
router.get('/:id', guideController.getGuideById);

// Protected routes (require authentication)
router.get('/:id/access', authMiddleware, guideController.checkGuideAccess);
router.post('/:id/purchase', authMiddleware, guideController.initiateGuidePurchase);
router.get('/purchases/my-guides', authMiddleware, guideController.getUserPurchases);
router.get('/download/:guideId', authMiddleware, guideController.downloadGuide);

module.exports = router;
