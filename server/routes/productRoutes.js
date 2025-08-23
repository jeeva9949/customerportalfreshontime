const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getAllCategories);

// Admin-only routes
router.post('/', protect, isAdmin, productController.createProduct);
router.put('/:id', protect, isAdmin, productController.updateProduct);
router.delete('/:id', protect, isAdmin, productController.deleteProduct);
router.post('/categories', protect, isAdmin, productController.createCategory);

module.exports = router;