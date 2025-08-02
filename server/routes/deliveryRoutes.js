// ====================================================
// --- File: server/routes/deliveryRoutes.js ---
// ====================================================
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, deliveryController.getAllDeliveries);
router.post('/', authMiddleware, deliveryController.createDelivery);
router.put('/:id', authMiddleware, deliveryController.updateDelivery);
router.delete('/:id', authMiddleware, deliveryController.deleteDelivery);

module.exports = router;