// ====================================================
// --- File: server/server.js (FINAL WORKING VERSION) ---
// ====================================================
const express = require('express');
const http = require('http');
const { Op } = require('sequelize');

require('dotenv').config();
const cors = require('cors');
const cron = require('node-cron');
const db = require('./models');
const routes = require('./routes');
const notificationController = require('./controllers/notificationController');
const { initializeSocket, getIO } = require('./socket'); // Import from new socket.js file

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO using the function from socket.js
const io = initializeSocket(server);

const PORT = process.env.PORT || 5000;

// --- CORS Configuration for Express ---
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.18:3000"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('FreshOnTime API is running...');
});

// --- Automated Daily Tasks ---
// NEW: Cron job for creating recurring deliveries for the current day
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily task: Creating recurring deliveries for today...');
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        // Find all successful recurring deliveries from yesterday
        const successfulRecurringDeliveries = await db.Delivery.findAll({
            where: {
                is_recurring: true,
                status: 'Delivered',
                delivery_date: {
                    [Op.between]: [startOfYesterday, endOfYesterday]
                }
            }
        });

        if (successfulRecurringDeliveries.length === 0) {
            console.log('No successful recurring deliveries from yesterday to recreate.');
            return;
        }

        const newDeliveries = [];
        for (const delivery of successfulRecurringDeliveries) {
            // IMPORTANT: Check if the customer still exists before creating a new delivery
            const customer = await db.Customer.findByPk(delivery.customer_id);
            if (customer) {
                newDeliveries.push({
                    customer_id: delivery.customer_id,
                    agent_id: delivery.agent_id,
                    item: delivery.item,
                    delivery_date: new Date(), // Set to today
                    status: 'Pending',
                    is_recurring: true // Keep it recurring
                });
            } else {
                console.log(`Customer with ID ${delivery.customer_id} has been deleted. Stopping recurring delivery.`);
            }
        }

        if (newDeliveries.length > 0) {
            await db.Delivery.bulkCreate(newDeliveries);
            console.log(`Successfully created ${newDeliveries.length} new recurring deliveries for today.`);
            getIO().emit('deliveries_updated'); // Notify clients
        }

    } catch (error) {
        console.error('Error in daily recurring delivery creation task:', error);
    }
}, { scheduled: true, timezone: "Asia/Kolkata" });


// Cron job for assigning any unassigned deliveries for today
let lastAssignedAgentIndex = 0;
cron.schedule('0 1 * * *', async () => {
    console.log('Running daily task: Assigning unassigned deliveries...');
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const unassignedDeliveries = await db.Delivery.findAll({
            where: { agent_id: null, delivery_date: { [Op.gte]: today, [Op.lt]: tomorrow } },
            include: [{ model: db.Customer, as: 'customer' }]
        });

        if (unassignedDeliveries.length === 0) {
            console.log('No unassigned deliveries for today.');
            return;
        }

        const availableAgents = await db.Agent.findAll({ where: { notifications_enabled: true } });

        if (availableAgents.length === 0) {
            console.log('No available agents to assign deliveries to.');
            return;
        }

        for (const delivery of unassignedDeliveries) {
            const agentToAssign = availableAgents[lastAssignedAgentIndex];
            await delivery.update({ agent_id: agentToAssign.id });
            console.log(`Assigned delivery ${delivery.id} to agent ${agentToAssign.name}`);
            await notificationController.sendNewDeliverySms(agentToAssign, delivery.customer);
            lastAssignedAgentIndex = (lastAssignedAgentIndex + 1) % availableAgents.length;
        }

        console.log(`Successfully assigned ${unassignedDeliveries.length} deliveries.`);
        getIO().emit('deliveries_updated');
    } catch (error) {
        console.error('Error running the daily delivery assignment task:', error);
    }
}, { scheduled: true, timezone: "Asia/Kolkata" });


const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database or start server:', error);
    }
};

startServer();
