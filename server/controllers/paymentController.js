/*
 * server/controllers/paymentController.js
 */
const { Payment, Customer: PaymentCustomerModel } = require('../models');
exports.getAllPayments = async (req, res) => {
    try { res.status(200).json(await Payment.findAll({ include: [{ model: PaymentCustomerModel, as: 'customer' }] })); } 
    catch (error) { res.status(500).json({ message: 'Error fetching payments', error: error.message }); }
};
exports.createPayment = async (req, res) => {
    try { res.status(201).json(await Payment.create(req.body)); } 
    catch (error) { res.status(500).json({ message: 'Error creating payment', error: error.message }); }
};
exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Payment.update(req.body, { where: { id: id } });
        if (updated) { return res.status(200).json(await Payment.findByPk(id)); }
        throw new Error('Payment not found');
    } catch (error) { res.status(500).json({ message: 'Error updating payment', error: error.message }); }
};
exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        if (await Payment.destroy({ where: { id: id } })) { return res.status(204).send(); }
        throw new Error('Payment not found');
    } catch (error) { res.status(500).json({ message: 'Error deleting payment', error: error.message }); }
};
