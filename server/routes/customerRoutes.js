/*
 * server/routes/customerRoutes.js
 */
const customerExpress = require('express'); // FIX: require express
const customerRouter = customerExpress.Router();
const customerController = require('../controllers/customerController');
customerRouter.get('/', customerController.getAllCustomers);
customerRouter.post('/', customerController.createCustomer);
customerRouter.put('/:id', customerController.updateCustomer);
customerRouter.delete('/:id', customerController.deleteCustomer);
module.exports = customerRouter;