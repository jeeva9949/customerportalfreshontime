const { Subscription, SubscriptionPlan, Customer } = require('../models');
const { getIO } = require('../socket');
const { addDays, addWeeks, addMonths, differenceInMilliseconds } = require('date-fns');

// --- Helper Functions ---
const calculateEndDate = (startDate, duration) => {
    // This logic is slightly adjusted to handle weekly plans better.
    if (duration.toLowerCase().includes('daily')) return addDays(startDate, 1);
    if (duration.toLowerCase().includes('weekly')) return addWeeks(startDate, 1);
    if (duration.toLowerCase().includes('monthly')) return addMonths(startDate, 1);
    return addMonths(startDate, 1);
};

// --- Existing Core Functions (No Changes) ---

exports.createSubscription = async (req, res) => {
    const { planId } = req.body;
    const customerId = req.user.id;
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
        getIO().emit('subscriptions_updated');
        res.status(201).json(newSubscription);
    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
};

exports.getCustomerSubscriptions = async (req, res) => {
    const customerId = req.user.id;
    try {
        const subscriptions = await Subscription.findAll({
            where: { customerId },
            include: [SubscriptionPlan],
            order: [['startDate', 'DESC']]
        });
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch subscriptions', error: error.message });
    }
};

// --- NEW Management Functions (Added to the end of the file) ---

exports.pauseSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.id);
        if (subscription.customerId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        subscription.status = 'paused';
        subscription.pausedAt = new Date(); // Record when it was paused
        await subscription.save();

        getIO().emit('subscriptions_updated');
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to pause subscription', error: error.message });
    }
};

exports.resumeSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.id);
        if (subscription.customerId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
        if (subscription.status !== 'paused' || !subscription.pausedAt) {
            return res.status(400).json({ message: 'Subscription is not paused.' });
        }

        // Calculate how long it was paused and extend the end date
        const pauseDuration = differenceInMilliseconds(new Date(), subscription.pausedAt);
        subscription.endDate = new Date(subscription.endDate.getTime() + pauseDuration);
        subscription.status = 'active';
        subscription.pausedAt = null; // Clear the pause timestamp
        await subscription.save();

        getIO().emit('subscriptions_updated');
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to resume subscription', error: error.message });
    }
};

exports.cancelNextCycle = async (req, res) => {
    try {
        const subscription = await Subscription.findByPk(req.params.id);
        if (subscription.customerId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        subscription.status = 'cancelled'; // This prevents auto-renewal
        await subscription.save();

        getIO().emit('subscriptions_updated');
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
    }
};

exports.renewSubscription = async (req, res) => {
    try {
        const oldSubscription = await Subscription.findByPk(req.params.id);
        if (oldSubscription.customerId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        const plan = await SubscriptionPlan.findByPk(oldSubscription.planId);
        const newStartDate = oldSubscription.endDate; // The new plan starts when the old one ends
        const newEndDate = calculateEndDate(newStartDate, plan.duration);

        // Create a new subscription record for the next cycle
        const newSubscription = await Subscription.create({
            customerId: oldSubscription.customerId,
            planId: oldSubscription.planId,
            startDate: newStartDate,
            endDate: newEndDate,
            status: 'active'
        });
        
        oldSubscription.status = 'expired'; // Mark the old one as expired
        await oldSubscription.save();

        getIO().emit('subscriptions_updated');
        res.status(201).json(newSubscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to renew subscription', error: error.message });
    }
};


// --- Existing Admin Functions (No Changes) ---

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

exports.updateSubscriptionStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const subscription = await Subscription.findByPk(id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found.' });
        }
        if (req.user.role === 'Customer' && subscription.customerId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this subscription.' });
        }
        subscription.status = status;
        await subscription.save();
        getIO().emit('subscriptions_updated');
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update subscription status', error: error.message });
    }
};
