// ====================================================
// --- File: server/routes/agentRoutes.js (CORRECTED) ---
// ====================================================
// This file has the routes reordered to fix the error.

const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', agentController.login);

// IMPORTANT: The specific '/notifications' route must come BEFORE the generic '/:id' route.
router.put('/notifications', authMiddleware, agentController.updateNotificationPreference);

router.get('/', authMiddleware, agentController.getAllAgents);
router.post('/', authMiddleware, agentController.createAgent);
router.put('/:id', authMiddleware, agentController.updateAgent);
router.delete('/:id', authMiddleware, agentController.deleteAgent);

module.exports = router;