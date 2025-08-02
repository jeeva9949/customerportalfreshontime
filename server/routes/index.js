// ====================================================
// --- File: server/routes/index.js (UPDATED) ---
// ====================================================
const express = require('express');
const masterRouter = express.Router();

// Import individual routers
const authRoutes = require('./authRoutes');
const agentRoutes = require('./agentRoutes');
const customerRoutes = require('./customerRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const paymentRoutes = require('./paymentRoutes');
const supportRoutes = require('./supportRoutes');
const passwordRoutes = require('./passwordRoutes'); // New

// Use the routers with their base paths
masterRouter.use('/auth', authRoutes);
masterRouter.use('/agents', agentRoutes);
masterRouter.use('/customers', customerRoutes);
masterRouter.use('/deliveries', deliveryRoutes);
masterRouter.use('/payments', paymentRoutes);
masterRouter.use('/support', supportRoutes);
masterRouter.use('/password-requests', passwordRoutes); // New

module.exports = masterRouter;
