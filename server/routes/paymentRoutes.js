/*
 * server/routes/paymentRoutes.js (UPDATED)
 */
const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController');
paymentRouter.get('/', paymentController.getAllPayments);
paymentRouter.post('/', paymentController.createPayment);
paymentRouter.put('/:id', paymentController.updatePayment); // Added
paymentRouter.delete('/:id', paymentController.deletePayment); // Added
module.exports = paymentRouter;
