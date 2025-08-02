/*
 * server/server.js (UPDATED)
 * This version correctly registers all API routes.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const agentRoutes = require('./routes/agentRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
db.sequelize.sync().then(() => {
  app.listen(PORT, () => { console.log(`Server is running on port ${PORT}.`); });
});
