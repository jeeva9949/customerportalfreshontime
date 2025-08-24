const { Subscription, SubscriptionPlan, Customer } = require('../models');
const { getIO } = require('../socket');
const { addDays, addWeeks, addMonths } = require('date-fns');

// Calculate end date based on plan duration
const calculateEndDate = (startDate, duration) => {
    if (duration.toLowerCase().includes('daily')) return addDays(startDate, 1);
    if (duration.toLowerCase().includes('weekly')) return addWeeks(startDate, 1);
    if (duration.toLowerCase().includes('monthly')) return addMonths(startDate, 1);
    return addMonths(startDate, 1); // Default to monthly
};

// Create a new subscription for a customer
exports.createSubscription = async (req, res) => {
    const { planId } = req.body;
    const customerId = req.user.id; // From authMiddleware

    try {
        const plan = await SubscriptionPlan.findByPk(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Subscription plan not found.' });
        }

        const startDate = new Date();
        const endDate = calculateEndDate(startDate, plan.duration);

        const newSubscription = await Subscription.create({
            customerId,
            planId,
            startDate,
            endDate,
            status: 'active'
        });

        getIO().emit('subscriptions_updated'); // Notify all clients
        res.status(201).json(newSubscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
};

// Get all subscriptions for the logged-in customer
exports.getCustomerSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            where: { customerId: req.user.id },
            include: [SubscriptionPlan] // Include plan details
        });
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch subscriptions', error: error.message });
    }
};

// Get all subscriptions (for Admin)
exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            include: [Customer, SubscriptionPlan]
        });
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all subscriptions', error: error.message });
    }
};

// Update a subscription's status (for Customer and Admin)
exports.updateSubscriptionStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'paused', 'cancelled'

    try {
        const subscription = await Subscription.findByPk(id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found.' });
        }

        // Optional: Add ownership check for customers
        if (req.user.role === 'Customer' && subscription.customerId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this subscription.' });
        }

        subscription.status = status;
        await subscription.save();

        getIO().emit('subscriptions_updated');
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update subscription', error: error.message });
    }
};