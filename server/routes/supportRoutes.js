const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, supportController.getAllTickets);
router.post('/', protect, supportController.createTicket);
router.put('/:id', protect, supportController.updateTicket);

module.exports = router;
