/*
 * server/controllers/deliveryController.js (UPDATED)
 * This file contains the corrected logic for creating and updating deliveries.
 */
const { Delivery, Customer, User } = require('../models');

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.findAll({
            include: [
                { model: Customer, as: 'customer' },
                { model: User, as: 'agent' }
            ]
        });
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching deliveries', error: error.message });
    }
};

// Create a new delivery
exports.createDelivery = async (req, res) => {
    try {
        // THIS IS THE FIX:
        // It correctly takes 'customerId' from the frontend payload
        // and maps it to the 'customer_id' database column.
        const { customerId, agentId, delivery_date, item, status } = req.body;
        const newDelivery = await Delivery.create({
            customer_id: customerId,
            agent_id: agentId,
            delivery_date,
            item,
            status
        });
        res.status(201).json(newDelivery);
    } catch (error) {
        res.status(500).json({ message: 'Error creating delivery', error: error.message });
    }
};

// Update an existing delivery
exports.updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        // Also fixed here for consistency
        const { customerId, agentId, ...rest } = req.body;
        const [updated] = await Delivery.update({
            customer_id: customerId,
            agent_id: agentId,
            ...rest
        }, { where: { id: id } });

        if (updated) {
            const updatedDelivery = await Delivery.findByPk(id);
            return res.status(200).json(updatedDelivery);
        }
        throw new Error('Delivery not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating delivery', error: error.message });
    }
};

// Delete a delivery
exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Delivery.destroy({ where: { id: id } });
        if (deleted) {
            return res.status(204).send();
        }
        throw new Error('Delivery not found');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting delivery', error: error.message });
    }
};
