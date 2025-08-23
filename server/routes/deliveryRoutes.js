const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, deliveryController.getAllDeliveries);
router.post('/', protect, deliveryController.createDelivery);
router.put('/:id', protect, deliveryController.updateDelivery);
router.delete('/:id', protect, deliveryController.deleteDelivery);

module.exports = router;
