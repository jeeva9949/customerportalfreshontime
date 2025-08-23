const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/agents', protect, locationController.getAgentLocations);

module.exports = router;
