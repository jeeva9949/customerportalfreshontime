/*
 * server/server.js
 * Main server entry point.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const agentRoutes = require('./routes/agentRoutes'); // Now active
const deliveryRoutes = require('./routes/deliveryRoutes'); // Now active


app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/agents', agentRoutes); // Now active
app.use('/api/deliveries', deliveryRoutes); // Now active


const PORT = process.env.PORT || 5000;
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});
