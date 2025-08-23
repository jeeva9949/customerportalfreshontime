const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
// CORRECTED IMPORT: Destructure 'protect' from the middleware module
const { protect } = require('../middleware/authMiddleware');

router.post('/login', agentController.login);

// Use the 'protect' function directly
router.put('/notifications', protect, agentController.updateNotificationPreference);

router.get('/', protect, agentController.getAllAgents);
router.post('/', protect, agentController.createAgent);
router.put('/:id', protect, agentController.updateAgent);
router.delete('/:id', protect, agentController.deleteAgent);

module.exports = router;