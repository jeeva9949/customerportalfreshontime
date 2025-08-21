const express = require('express');
const masterRouter = express.Router();

// Import individual routers
const authRoutes = require('./authRoutes');
const agentRoutes = require('./agentRoutes');
const customerRoutes = require('./customerRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const paymentRoutes = require('./paymentRoutes');
const supportRoutes = require('./supportRoutes');
const passwordRoutes = require('./passwordRoutes');
const locationRoutes = require('./locationRoutes'); // New
const customerAuthRoutes = require('./customerAuthRoutes'); // <-- ADD THIS LINE

// Use the routers with their base paths
masterRouter.use('/auth', authRoutes);
masterRouter.use('/agents', agentRoutes);
masterRouter.use('/customers', customerRoutes);
masterRouter.use('/deliveries', deliveryRoutes);
masterRouter.use('/payments', paymentRoutes);
masterRouter.use('/support', supportRoutes);
masterRouter.use('/password-requests', passwordRoutes);
masterRouter.use('/locations', locationRoutes); // New
masterRouter.use('/customer-auth', customerAuthRoutes); // <-- ADD THIS LINE



module.exports = masterRouter;
