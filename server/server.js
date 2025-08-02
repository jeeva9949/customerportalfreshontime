// ====================================================
// --- File: server/server.js (Main Entry Point) ---
// ====================================================
// This is the main file to start your server.

const express = require('express');
const cors = require('cors');
const db = require('./models'); // Imports from models/index.js
const routes = require('./routes'); // Imports the master router from routes/index.js

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