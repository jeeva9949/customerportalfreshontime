// ====================================================
// --- File: server/controllers/customerController.js ---
// ====================================================
const db = require('../models');

exports.getAllCustomers = async (req, res) => {
    try { res.status(200).json(await db.Customer.findAll()); } 
    catch (error) { res.status(500).json({ message: 'Error fetching customers', error: error.message }); }
};

exports.createCustomer = async (req, res) => {
    try { res.status(201).json(await db.Customer.create(req.body)); } 
    catch (error) { res.status(500).json({ message: 'Error creating customer', error: error.message }); }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Customer.update(req.body, { where: { id: id } });
        if (updated) return res.status(200).json(await db.Customer.findByPk(id));
        throw new Error('Customer not found');
    } catch (error) { res.status(500).json({ message: 'Error updating customer', error: error.message }); }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        if (await db.Customer.destroy({ where: { id: id } })) return res.status(204).send();
        throw new Error('Customer not found');
    } catch (error) { res.status(500).json({ message: 'Error deleting customer', error: error.message }); }
};
