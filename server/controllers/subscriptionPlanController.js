const { SubscriptionPlan } = require('../models');
const { getIO } = require('../socket');

// Public route
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAll();
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscription plans', error: error.message });
    }
};

// Admin-only routes
exports.createPlan = async (req, res) => {
    try {
        const newPlan = await SubscriptionPlan.create(req.body);
        getIO().emit('subscription_plans_updated');
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(400).json({ message: 'Error creating subscription plan', error: error.message });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await SubscriptionPlan.update(req.body, { where: { id } });
        if (updated) {
            const updatedPlan = await SubscriptionPlan.findByPk(id);
            getIO().emit('subscription_plans_updated');
            return res.status(200).json(updatedPlan);
        }
        throw new Error('Subscription plan not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating subscription plan', error: error.message });
    }
};
