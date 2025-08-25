const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- Existing Customer routes ---
router.post('/subscribe', protect, subscriptionController.createSubscription);
router.get('/my-subscriptions', protect, subscriptionController.getCustomerSubscriptions);
router.put('/:id/status', protect, subscriptionController.updateSubscriptionStatus);

// --- NEW Customer Management Routes ---
router.put('/:id/pause', protect, subscriptionController.pauseSubscription);
router.put('/:id/resume', protect, subscriptionController.resumeSubscription);
router.put('/:id/cancel', protect, subscriptionController.cancelNextCycle);
router.post('/:id/renew', protect, subscriptionController.renewSubscription);

// --- Existing Admin routes ---
router.get('/all', protect, isAdmin, subscriptionController.getAllSubscriptions);
router.put('/:id/admin-status', protect, isAdmin, subscriptionController.updateSubscriptionStatus);


module.exports = router;
