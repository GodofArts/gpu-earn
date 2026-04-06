/**
 * Platform Routes
 */

const express = require('express');
const platformController = require('../controllers/platformController');

const router = express.Router();

// Public routes
router.get('/', platformController.getPlatformsByCategory);  // GET /api/platforms → all platforms
router.get('/categories', platformController.getPlatformsByCategory);
router.get('/comparison', platformController.getPlatformComparison);
router.get('/recommendations', platformController.getRecommendations);
router.get('/:slug', platformController.getPlatformDetails);
router.post('/calculate-earnings', platformController.calculateEarnings);

module.exports = router;
