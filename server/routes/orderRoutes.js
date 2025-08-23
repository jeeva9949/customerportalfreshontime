const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes are protected and require a logged-in user
router.use(protect);

// POST /api/orders - Create a new order from the cart
router.post('/', orderController.createOrder);

// GET /api/orders - Get all orders for the logged-in customer
router.get('/', orderController.getCustomerOrders);

module.exports = router;
