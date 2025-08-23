const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public route
router.get('/plans', subscriptionPlanController.getAllPlans);

// Admin-only routes
router.post('/plans', protect, isAdmin, subscriptionPlanController.createPlan);
router.put('/plans/:id', protect, isAdmin, subscriptionPlanController.updatePlan);

module.exports = router;
