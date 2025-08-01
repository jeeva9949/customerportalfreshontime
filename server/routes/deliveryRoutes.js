/*
 * server/routes/deliveryRoutes.js
 */
const deliveryExpress = require('express');
const deliveryRouter = deliveryExpress.Router();
const deliveryController = require('../controllers/deliveryController');
deliveryRouter.get('/', deliveryController.getAllDeliveries);
deliveryRouter.post('/', deliveryController.createDelivery);
deliveryRouter.put('/:id', deliveryController.updateDelivery);
deliveryRouter.delete('/:id', deliveryController.deleteDelivery);
module.exports = deliveryRouter;