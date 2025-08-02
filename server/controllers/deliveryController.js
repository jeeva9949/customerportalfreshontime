/*
 * server/controllers/deliveryController.js
 */
const { Delivery, Customer: DeliveryCustomerModel, Agent: DeliveryAgentModel } = require('../models');
exports.getAllDeliveries = async (req, res) => {
    try {
        res.status(200).json(await Delivery.findAll({ include: [ { model: DeliveryCustomerModel, as: 'customer' }, { model: DeliveryAgentModel, as: 'agent', attributes: { exclude: ['password'] } } ] }));
    } catch (error) { res.status(500).json({ message: 'Error fetching deliveries', error: error.message }); }
};
exports.createDelivery = async (req, res) => {
    try {
        const newDelivery = await Delivery.create(req.body);
        res.status(201).json(newDelivery);
    } catch (error) { res.status(500).json({ message: 'Error creating delivery', error: error.message }); }
};
exports.updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Delivery.update(req.body, { where: { id: id } });
        if (updated) { return res.status(200).json(await Delivery.findByPk(id)); }
        throw new Error('Delivery not found');
    } catch (error) { res.status(500).json({ message: 'Error updating delivery', error: error.message }); }
};
exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        if (await Delivery.destroy({ where: { id: id } })) { return res.status(204).send(); }
        throw new Error('Delivery not found');
    } catch (error) { res.status(500).json({ message: 'Error deleting delivery', error: error.message }); }
};