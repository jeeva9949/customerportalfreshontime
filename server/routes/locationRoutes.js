const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

// This endpoint is used for the initial data load on the map page.
router.get('/agents', authMiddleware, locationController.getAgentLocations);

module.exports = router;
