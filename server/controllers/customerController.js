const db = require('../models');
const { getIO } = require('../socket');

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await db.Customer.findAll();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const newCustomer = await db.Customer.create(req.body);
        getIO().emit('customers_updated');
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Customer.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedCustomer = await db.Customer.findByPk(id);
            getIO().emit('customers_updated');
            return res.status(200).json(updatedCustomer);
        }
        throw new Error('Customer not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Customer.destroy({ where: { id: id } });
        if (deleted) {
            getIO().emit('customers_updated');
            return res.status(204).send();
        }
        throw new Error('Customer not found');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
};
