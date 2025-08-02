// ====================================================
// --- File: server/routes/supportRoutes.js ---
// ====================================================
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, supportController.getAllTickets);
router.post('/', authMiddleware, supportController.createTicket);

module.exports = router;
