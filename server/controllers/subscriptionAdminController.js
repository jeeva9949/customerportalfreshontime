const { Subscription, PauseHistory, Delivery, Agent, Customer, SubscriptionPlan, sequelize } = require('../models');
const { getIO } = require('../socket');
const { addDays } = require('date-fns');

// Helper to find the next available agent
const findNextAvailableAgent = async () => {
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
        res.status(500).json({ message: 'Failed to fetch subscription details', error: error.message });
    }
};

exports.pauseSubscription = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByPk(subscriptionId);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });

        subscription.status = 'paused';
        subscription.pausedAt = new Date(); // Set paused date
        subscription.resumedAt = null; // Clear resumed date
        await subscription.save({ transaction });

        await PauseHistory.create({
            subscriptionId: subscription.id,
            pauseDate: new Date()
        }, { transaction });

        await Delivery.update({ status: 'Cancelled' }, {
            where: {
                customer_id: subscription.customerId,
                status: 'Pending'
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

// --- UPDATED FUNCTION ---
// This now correctly sets the 'resumedAt' field in the database.
exports.resumeSubscription = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByPk(subscriptionId);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });

        const today = new Date();
        subscription.status = 'active';
        subscription.nextDeliveryDate = addDays(today, 1);
        subscription.resumedAt = today; // Set the resumed date
        subscription.pausedAt = null; // Clear the paused date
        await subscription.save({ transaction });

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
