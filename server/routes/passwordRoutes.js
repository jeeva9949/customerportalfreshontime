// ====================================================
// --- File: server/routes/passwordRoutes.js (NEW) ---
// ====================================================
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, passwordController.getAllRequests);
router.post('/', authMiddleware, passwordController.createRequest);
router.put('/:id/approve', authMiddleware, passwordController.approveRequest);

module.exports = router;