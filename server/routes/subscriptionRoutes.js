const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTE ---
// Anyone can view the available subscription plans
router.get('/plans', subscriptionPlanController.getAllPlans);


// --- CUSTOMER-ONLY ROUTES ---
// These routes are protected and can only be accessed by a logged-in customer

// Create a new subscription
router.post('/subscribe', protect, subscriptionController.createSubscription);

// Get the logged-in customer's own subscriptions
router.get('/my-subscriptions', protect, subscriptionController.getCustomerSubscriptions);

// Manage their own subscription (pause, resume, etc.)
router.put('/:id/pause', protect, subscriptionController.pauseSubscription);
router.put('/:id/resume', protect, subscriptionController.resumeSubscription);
router.put('/:id/cancel', protect, subscriptionController.cancelNextCycle);
router.post('/:id/renew', protect, subscriptionController.renewSubscription);


// --- ADMIN-ONLY ROUTES (for viewing all subscriptions) ---
// Note: Management routes (pause/resume/cancel by admin) are in subscriptionAdminRoutes.js

// Get all subscriptions from all customers
router.get('/all', protect, isAdmin, subscriptionController.getAllSubscriptions);

// Update status (a general-purpose route you had)
router.put('/:id/admin-status', protect, isAdmin, subscriptionController.updateSubscriptionStatus);


module.exports = router;
