const { Product, Category } = require('../models');
const { getIO } = require('../socket');

// --- Public/Customer APIs ---
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { isActive: true },
            include: [{ model: Category, attributes: ['name'] }]
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// --- Admin-only APIs ---
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = await Category.create({ name, description });
        getIO().emit('categories_updated');
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        getIO().emit('products_updated');
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Product.update(req.body, { where: { id } });
        if (updated) {
            const updatedProduct = await Product.findByPk(id);
            getIO().emit('products_updated');
            return res.status(200).json(updatedProduct);
        }
        throw new Error('Product not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.destroy({ where: { id } });
        if (deleted) {
            getIO().emit('products_updated');
            return res.status(204).send();
        }
        throw new Error('Product not found');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};
