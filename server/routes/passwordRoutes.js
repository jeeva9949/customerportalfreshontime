const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, passwordController.getAllRequests);
router.post('/', protect, passwordController.createRequest);
router.put('/:id/approve', protect, passwordController.approveRequest);

module.exports = router;
