// ====================================================
// --- File: server/controllers/deliveryController.js ---
// ====================================================
const db = require('../models');

exports.getAllDeliveries = async (req, res) => {
    try {
        res.status(200).json(await db.Delivery.findAll({ include: [{ model: db.Customer, as: 'customer' }, { model: db.Agent, as: 'agent', attributes: { exclude: ['password'] } }] }));
    } catch (error) { res.status(500).json({ message: 'Error fetching deliveries', error: error.message }); }
};

exports.createDelivery = async (req, res) => {
    try { res.status(201).json(await db.Delivery.create(req.body)); } 
    catch (error) { res.status(500).json({ message: 'Error creating delivery', error: error.message }); }
};

exports.updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Delivery.update(req.body, { where: { id: id } });
        if (updated) return res.status(200).json(await db.Delivery.findByPk(id));
        throw new Error('Delivery not found');
    } catch (error) { res.status(500).json({ message: 'Error updating delivery', error: error.message }); }
};

exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        if (await db.Delivery.destroy({ where: { id: id } })) return res.status(204).send();
        throw new Error('Delivery not found');
    } catch (error) { res.status(500).json({ message: 'Error deleting delivery', error: error.message }); }
};
