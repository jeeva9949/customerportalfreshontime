const express = require('express');
const masterRouter = express.Router();

// Import all routers
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
const orderRoutes = require('./orderRoutes');
const subscriptionRoutes = require('./subscriptionRoutes'); 
const subscriptionAdminRoutes = require('./subscriptionAdminRoutes'); // Your separate admin routes

// Use the routers with their base paths
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
masterRouter.use('/orders', orderRoutes);

// Use the general subscription router for '/subscriptions'
masterRouter.use('/subscriptions', subscriptionRoutes);

// Use the admin-specific router for '/admin'
masterRouter.use('/admin', subscriptionAdminRoutes);


module.exports = masterRouter;
