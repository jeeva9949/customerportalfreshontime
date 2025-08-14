const db = require('../models');
const notificationController = require('./notificationController');
const { getIO } = require('../socket');

exports.getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await db.Delivery.findAll({
            include: [
                { model: db.Customer, as: 'customer' },
                { model: db.Agent, as: 'agent', attributes: { exclude: ['password'] } }
            ]
        });
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching deliveries', error: error.message });
    }
};

exports.createDelivery = async (req, res) => {
    try {
        const newDelivery = await db.Delivery.create(req.body);
        const deliveryWithDetails = await db.Delivery.findByPk(newDelivery.id, {
            include: [
                { model: db.Customer, as: 'customer' },
                { model: db.Agent, as: 'agent', attributes: { exclude: ['password'] } }
            ]
        });

        getIO().emit('deliveries_updated');

        if (deliveryWithDetails.agent_id) {
            const agent = await db.Agent.findByPk(deliveryWithDetails.agent_id);
            const customer = await db.Customer.findByPk(deliveryWithDetails.customer_id);
            if (agent && customer) {
                await notificationController.sendNewDeliverySms(agent, customer);
            }
        }
        res.status(201).json(deliveryWithDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error creating delivery', error: error.message });
    }
};

exports.updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Delivery.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedDelivery = await db.Delivery.findByPk(id);
            getIO().emit('deliveries_updated');
            return res.status(200).json(updatedDelivery);
        }
        throw new Error('Delivery not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating delivery', error: error.message });
    }
};

exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Delivery.destroy({ where: { id: id } });
        if (deleted) {
            getIO().emit('deliveries_updated');
            return res.status(204).send();
        }
        throw new Error('Delivery not found');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting delivery', error: error.message });
    }
};
