// ====================================================
// --- File: server/routes/supportRoutes.js ---
// ====================================================
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, supportController.getAllTickets);
router.post('/', authMiddleware, supportController.createTicket);
router.put('/:id', authMiddleware, supportController.updateTicket); // This route handles the "Resolve" action

module.exports = router;