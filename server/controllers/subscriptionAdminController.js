const { Subscription, PauseHistory, Delivery, Agent, Customer, SubscriptionPlan, sequelize } = require('../models');
const { getIO } = require('../socket');
const { differenceInDays, addDays } = require('date-fns');

// Helper to find the next available agent
const findNextAvailableAgent = async () => {
    // This is a simple round-robin assignment. You can make this more complex based on agent load, location, etc.
    const agents = await Agent.findAll({ order: [['id', 'ASC']] });
    if (!agents.length) return null;
    
    const lastDelivery = await Delivery.findOne({ order: [['createdAt', 'DESC']] });
    if (!lastDelivery || !lastDelivery.agent_id) return agents[0].id;

    const lastAgentIndex = agents.findIndex(a => a.id === lastDelivery.agent_id);
    const nextAgentIndex = (lastAgentIndex + 1) % agents.length;
    return agents[nextAgentIndex].id;
};


exports.getSubscriptionDetailsForCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const subscription = await Subscription.findOne({
            where: { customerId, status: ['active', 'paused', 'cancelled'] },
            include: [
                { model: SubscriptionPlan },
                { model: PauseHistory, order: [['pauseDate', 'DESC']] }
            ],
            order: [['createdAt', 'DESC']]
        });
        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found for this customer.' });
        }
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscription details', error: error.message });
    }
};

exports.pauseSubscription = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByPk(subscriptionId, { transaction });
        if (!subscription || subscription.status !== 'active') {
            return res.status(400).json({ message: 'Subscription cannot be paused.' });
        }

        subscription.status = 'paused';
        await subscription.save({ transaction });

        await PauseHistory.create({
            subscriptionId: subscription.id,
            pauseDate: new Date(),
        }, { transaction });

        await transaction.commit();
        getIO().emit('subscriptions_updated');
        res.status(200).json({ message: 'Subscription paused successfully.' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Failed to pause subscription', error: error.message });
    }
};

exports.resumeSubscription = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByPk(subscriptionId, { transaction });
        if (!subscription || subscription.status !== 'paused') {
            return res.status(400).json({ message: 'Subscription is not paused.' });
        }

        const lastPause = await PauseHistory.findOne({
            where: { subscriptionId: subscription.id, resumeDate: null },
            order: [['pauseDate', 'DESC']],
            transaction
        });

        if (!lastPause) {
             return res.status(400).json({ message: 'Could not find an active pause session to resume.' });
        }

        lastPause.resumeDate = new Date();
        await lastPause.save({ transaction });

        const pauseDurationDays = differenceInDays(lastPause.resumeDate, lastPause.pauseDate);
        
        subscription.endDate = addDays(new Date(subscription.endDate), pauseDurationDays);
        subscription.nextDeliveryDate = addDays(new Date(), 1); // Next delivery is tomorrow
        subscription.status = 'active';
        await subscription.save({ transaction });

        // Auto-assign a new delivery
        const agentId = await findNextAvailableAgent();
        if (agentId) {
            await Delivery.create({
                customer_id: subscription.customerId,
                agent_id: agentId,
                delivery_date: subscription.nextDeliveryDate,
                status: 'Pending',
                item: 'Subscription Delivery'
            }, { transaction });
        }

        await transaction.commit();
        getIO().emit('subscriptions_updated');
        getIO().emit('deliveries_updated');
        res.status(200).json({ message: 'Subscription resumed and new delivery scheduled.' });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Failed to resume subscription', error: error.message });
    }
};

exports.cancelSubscription = async (req, res) => {
     try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByPk(subscriptionId);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });

        subscription.status = 'cancelled';
        await subscription.save();

        getIO().emit('subscriptions_updated');
        res.status(200).json({ message: 'Subscription cancelled successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel subscription', error: error.message });
    }
};
