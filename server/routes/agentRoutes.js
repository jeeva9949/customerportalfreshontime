/*
 * server/routes/agentRoutes.js (UPDATED)
 */
const express = require('express');
const agentRouter = express.Router();
const agentController = require('../controllers/agentController');
agentRouter.post('/login', agentController.login); // Added login route
agentRouter.get('/', agentController.getAllAgents);
agentRouter.post('/', agentController.createAgent);
agentRouter.put('/:id', agentController.updateAgent);
agentRouter.delete('/:id', agentController.deleteAgent);
module.exports = agentRouter;

/*
 * All other backend files (controllers, routes, models, server.js) are correct as they were in the last complete version.
 */