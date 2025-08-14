const db = require('../models');
const { getIO } = require('../socket');

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await db.Payment.findAll({ include: [{ model: db.Customer, as: 'customer' }] });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const newPayment = await db.Payment.create(req.body);
        getIO().emit('payments_updated');
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Payment.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedPayment = await db.Payment.findByPk(id);
            getIO().emit('payments_updated');
            return res.status(200).json(updatedPayment);
        }
        throw new Error('Payment not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment', error: error.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Payment.destroy({ where: { id: id } });
        if (deleted) {
            getIO().emit('payments_updated');
            return res.status(204).send();
        }
        throw new Error('Payment not found');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error: error.message });
    }
};
