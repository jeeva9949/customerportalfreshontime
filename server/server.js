// ====================================================
// --- File: server/server.js (Main Entry Point) ---
// ====================================================
// This version includes an automated daily reset of deliveries.

const express = require('express');
const cors = require('cors');
const cron = require('node-cron'); // Import the cron library
const db = require('./models'); 
const routes = require('./routes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Middleware
app.use(cors());
app.use(express.json());

// Use the master router for all API calls
app.use('/api', routes);

// Default route
app.get('/', (req, res) => {
    res.send('FreshOnTime API is running...');
});

// --- Automated Daily Task ---
// This schedule runs every day at midnight ('0 0 * * *').
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily task: Resetting delivered items for the new day...');
    try {
        const [updatedCount] = await db.Delivery.update(
            { 
                status: 'Pending',
                delivery_date: new Date() // Set delivery date to the new day
            },
            { 
                where: { 
                    status: 'Delivered' 
                } 
            }
        );
        console.log(`Successfully reset ${updatedCount} deliveries to 'Pending' for the new day.`);
    } catch (error) {
        console.error('Error running the daily delivery reset task:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Set to your local timezone
});


// Start the server after connecting to the database
const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database or start server:', error);
    }
};

startServer();
