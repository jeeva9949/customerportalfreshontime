const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
// CORRECTED IMPORT: Destructure 'protect' from the middleware module
const { protect } = require('../middleware/authMiddleware');

// Use the 'protect' function directly
router.get('/', protect, paymentController.getAllPayments);
router.post('/', protect, paymentController.createPayment);
router.put('/:id', protect, paymentController.updatePayment);
router.delete('/:id', protect, paymentController.deletePayment);

module.exports = router;
