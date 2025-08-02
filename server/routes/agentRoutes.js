// File: server/routes/agentRoutes.js

const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', agentController.login);
router.get('/', authMiddleware, agentController.getAllAgents);
router.post('/', authMiddleware, agentController.createAgent);
router.put('/:id', authMiddleware, agentController.updateAgent);
router.delete('/:id', authMiddleware, agentController.deleteAgent);

module.exports = router;