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
const productRoutes = require('./productRoutes');
const subscriptionPlanRoutes = require('./subscriptionPlanRoutes');
const orderRoutes = require('./orderRoutes');

// --- Import the new subscription router ---
const subscriptionRoutes = require('./subscriptionRoutes');


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
masterRouter.use('/products', productRoutes);
masterRouter.use('/subscriptions', subscriptionPlanRoutes);
masterRouter.use('/orders', orderRoutes);

// --- Use the new subscription router ---
masterRouter.use('/subscriptions', subscriptionRoutes);


module.exports = masterRouter;