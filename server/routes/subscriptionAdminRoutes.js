const express = require('express');
const router = express.Router();
// Use the new controller file
const subAdminController = require('../controllers/subscriptionAdminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All routes in this file are protected and for admins only
router.use(protect, isAdmin);

// Subscription Management Routes
router.get('/customers/:customerId/subscription', subAdminController.getSubscriptionDetailsForCustomer);
router.put('/subscriptions/:subscriptionId/pause', subAdminController.pauseSubscription);
router.put('/subscriptions/:subscriptionId/resume', subAdminController.resumeSubscription);
router.put('/subscriptions/:subscriptionId/cancel', subAdminController.cancelSubscription);

module.exports = router;
