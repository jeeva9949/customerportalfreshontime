const db = require('../models');
const { getIO } = require('../socket');

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await db.Customer.findAll({ attributes: { exclude: ['password'] } });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const newCustomer = await db.Customer.create(req.body);
        getIO().emit('customers_updated');
        const customerData = newCustomer.toJSON();
        delete customerData.password;
        res.status(201).json(customerData);
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
};

// --- UPDATED FUNCTION ---
// This function is now more robust and will not crash if the frontend sends extra fields.
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await db.Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // 1. Define the fields that are actually allowed to be updated.
        const allowedUpdates = ['name', 'email', 'phone'];
        const updateData = {};

        // 2. Loop through the allowed fields and build a clean update object.
        // This prevents fields like 'address' from causing an error.
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        // 3. Perform the update with only the valid data.
        const [updated] = await db.Customer.update(updateData, { where: { id: id } });

        if (updated) {
            const updatedCustomer = await db.Customer.findByPk(id, { attributes: { exclude: ['password'] } });
            getIO().emit('customers_updated');
            return res.status(200).json(updatedCustomer);
        }
        
        // If no rows were updated but the customer exists, it means no valid fields were provided.
        // We can return the existing customer data.
        return res.status(200).json(customer);

    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};


exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Customer.destroy({ where: { id: id } });
        if (deleted) {
            getIO().emit('customers_updated');
            return res.status(204).send("Customer deleted");
        }
        throw new Error('Customer not found');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
};
