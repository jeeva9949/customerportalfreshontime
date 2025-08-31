const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes are protected and require a logged-in user
router.use(protect);

// POST /api/orders - Create a new order from the cart
router.post('/', orderController.createOrder);

// --- THIS IS THE FIX ---
// GET /api/orders - This now points to the generic `getOrders` function
// which correctly returns ALL orders for an admin.
router.get('/', orderController.getOrders);

module.exports = router;