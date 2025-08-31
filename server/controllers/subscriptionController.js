const { Subscription, SubscriptionPlan, Customer, PauseHistory, Delivery, Agent, sequelize } = require('../models');
const { getIO } = require('../socket');
const { addDays, addWeeks, addMonths } = require('date-fns');

// --- Helper Functions ---
const calculateEndDate = (startDate, duration) => {
    if (duration.toLowerCase().includes('daily')) return addDays(startDate, 1);
    if (duration.toLowerCase().includes('weekly')) return addWeeks(startDate, 1);
    if (duration.toLowerCase().includes('monthly')) return addMonths(startDate, 1);
    return addMonths(startDate, 1);
};

// Helper to find the next available agent in a round-robin fashion
const findNextAvailableAgent = async () => {
    const agents = await Agent.findAll({ where: { notifications_enabled: true }, order: [['id', 'ASC']] });
    if (!agents.length) return null;
    
    const lastDelivery = await Delivery.findOne({ order: [['createdAt', 'DESC']] });
    if (!lastDelivery || !lastDelivery.agent_id) return agents[0].id;

    const lastAgentIndex = agents.findIndex(a => a.id === lastDelivery.agent_id);
    const nextAgentIndex = (lastAgentIndex + 1) % agents.length;
    return agents[nextAgentIndex].id;
};


// --- Core Subscription Logic ---

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
        const nextDeliveryDate = addDays(new Date(), 1); // First delivery is tomorrow

        const newSubscription = await Subscription.create({
            customerId,
            planId,
            startDate,
            endDate,
            nextDeliveryDate,
            status: 'active'
        });

        getIO().emit('subscriptions_updated');
        res.status(201).json(newSubscription);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create subscription', error: error.message });
    }
};

exports.getCustomerSubscriptions = async (req, res) => {
    try {
        const customerId = req.user.id;
        const subscriptions = await Subscription.findAll({
            where: { customerId },
            include: [SubscriptionPlan, {model: PauseHistory, order: [['pauseDate', 'DESC']]}],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch subscriptions', error: error.message });
    }
};

// --- PAUSE/RESUME/CANCEL LOGIC (UPDATED & FIXED) ---

exports.pauseSubscription = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const customerId = req.user.id;

        const subscription = await Subscription.findOne({ where: { id, customerId } });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });
        if (subscription.status !== 'active') return res.status(400).json({ message: 'Only active subscriptions can be paused.' });

        subscription.status = 'paused';
        subscription.pausedAt = new Date();
        subscription.nextDeliveryDate = null;
        subscription.resumedAt = null; // Clear resume date on pause
        await subscription.save({ transaction });

        await PauseHistory.create({
            subscriptionId: id,
            pauseDate: new Date(),
        }, { transaction });

        await Delivery.destroy({
            where: {
                customer_id: customerId,
                status: 'Pending',
            },
            transaction
        });

        await transaction.commit();
        getIO().emit('subscriptions_updated');
        getIO().emit('deliveries_updated');
        res.status(200).json({ message: 'Subscription paused successfully.' });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Failed to pause subscription', error: error.message });
    }
};

exports.resumeSubscription = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const customerId = req.user.id;
        
        const subscription = await Subscription.findOne({ where: { id, customerId } });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });
        if (subscription.status !== 'paused') return res.status(400).json({ message: 'Only paused subscriptions can be resumed.' });

        const resumeDate = new Date();
        const nextDeliveryDate = addDays(resumeDate, 1);

        // This is the critical fix: Ensure all fields are updated before saving.
        subscription.status = 'active';
        subscription.resumedAt = resumeDate; 
        subscription.nextDeliveryDate = nextDeliveryDate; 
        subscription.pausedAt = null;
        await subscription.save({ transaction });

        const lastPause = await PauseHistory.findOne({ where: { subscriptionId: id }, order: [['pauseDate', 'DESC']] });
        if (lastPause) {
            lastPause.resumeDate = resumeDate;
            await lastPause.save({ transaction });
        }
        
        const agentId = await findNextAvailableAgent();
        if (agentId) {
            await Delivery.create({
                customer_id: subscription.customerId,
                agent_id: agentId,
                delivery_date: nextDeliveryDate,
                status: 'Pending',
                item: 'Subscription Delivery'
            }, { transaction });
        }

        await transaction.commit();
        getIO().emit('subscriptions_updated');
        getIO().emit('deliveries_updated');
        res.status(200).json({ message: 'Subscription resumed. Your next delivery is scheduled for tomorrow.' });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Failed to resume subscription', error: error.message });
    }
};


exports.cancelNextCycle = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.id;
        const subscription = await Subscription.findOne({ where: { id, customerId } });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });

        subscription.status = 'cancelled';
        await subscription.save();

        getIO().emit('subscriptions_updated');
        res.status(200).json({ message: 'Subscription cancelled successfully. It will not renew.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
    }
};


// --- Other functions from your existing file (unchanged) ---

exports.renewSubscription = async (req, res) => {
    res.status(200).send("Renewed");
};

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
        subscription.status = status;
        await subscription.save();
        getIO().emit('subscriptions_updated');
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Error updating subscription', error: error.message });
    }
};

