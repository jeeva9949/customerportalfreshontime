const express = require('express');
const masterRouter = express.Router();

// Import existing routers
const authRoutes = require('./authRoutes');
const agentRoutes = require('./agentRoutes');
const customerRoutes = require('./customerRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const paymentRoutes = require('./paymentRoutes');
const supportRoutes = require('./supportRoutes');
const passwordRoutes = require('./passwordRoutes');
const locationRoutes = require('./locationRoutes');
const customerAuthRoutes = require('./customerAuthRoutes');

// --- Import NEW routers ---
const productRoutes = require('./productRoutes');
const subscriptionPlanRoutes = require('./subscriptionPlanRoutes');
const orderRoutes = require('./orderRoutes');


// Use the existing routers with their base paths
masterRouter.use('/auth', authRoutes);
masterRouter.use('/agents', agentRoutes);
masterRouter.use('/customers', customerRoutes);
masterRouter.use('/deliveries', deliveryRoutes);
masterRouter.use('/payments', paymentRoutes);
masterRouter.use('/support', supportRoutes);
masterRouter.use('/password-requests', passwordRoutes);
masterRouter.use('/locations', locationRoutes);
masterRouter.use('/customer-auth', customerAuthRoutes);

// --- Use NEW routers ---
masterRouter.use('/products', productRoutes);
masterRouter.use('/subscriptions', subscriptionPlanRoutes);
masterRouter.use('/orders', orderRoutes);


module.exports = masterRouter;
