const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Customer routes
router.post('/subscribe', protect, subscriptionController.createSubscription);
router.get('/my-subscriptions', protect, subscriptionController.getCustomerSubscriptions);
router.put('/:id/status', protect, subscriptionController.updateSubscriptionStatus);

// Admin routes
router.get('/all', protect, isAdmin, subscriptionController.getAllSubscriptions);
router.put('/:id/admin-status', protect, isAdmin, subscriptionController.updateSubscriptionStatus);


module.exports = router;