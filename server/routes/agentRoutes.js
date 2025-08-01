/*
/*
 * server/routes/agentRoutes.js
 */
const agentExpress = require('express');
const agentRouter = agentExpress.Router();
const agentController = require('../controllers/agentController');
agentRouter.get('/', agentController.getAllAgents);
agentRouter.post('/', agentController.createAgent);
agentRouter.put('/:id', agentController.updateAgent);
agentRouter.delete('/:id', agentController.deleteAgent);
module.exports = agentRouter;