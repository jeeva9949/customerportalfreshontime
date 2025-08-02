// File: server/controllers/deliveryController.js

const db = require('../models');
const notificationController = require('./notificationController'); // Import the notification controller

exports.getAllDeliveries = async (req, res) => {
    try {
        res.status(200).json(await db.Delivery.findAll({ 
            include: [
                { model: db.Customer, as: 'customer' }, 
                { model: db.Agent, as: 'agent', attributes: { exclude: ['password'] } }
            ] 
        }));
    } catch (error) { 
        res.status(500).json({ message: 'Error fetching deliveries', error: error.message }); 
    }
};

exports.createDelivery = async (req, res) => {
    console.log("--- createDelivery function has been triggered ---"); // Debug message
    try {
        const newDelivery = await db.Delivery.create(req.body);
        console.log("Step 1: Delivery created successfully in DB. ID:", newDelivery.id); // Debug message

        const agent = await db.Agent.findByPk(newDelivery.agent_id);
        const customer = await db.Customer.findByPk(newDelivery.customer_id);
        console.log("Step 2: Fetched Agent and Customer from DB."); // Debug message

        if (agent && customer) {
            console.log("Step 3: Agent and Customer found. Calling notification function..."); // Debug message
            await notificationController.sendNewDeliverySms(agent, customer);
            console.log("Step 4: Notification function has been called."); // Debug message
        } else {
            console.log("Step 3 FAILED: Could not find Agent or Customer for notification."); // Debug message
        }

        res.status(201).json(newDelivery);
    } catch (error) { 
        console.error("--- ERROR in createDelivery ---", error); // Debug message
        res.status(500).json({ message: 'Error creating delivery', error: error.message }); 
    }
};

exports.updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Delivery.update(req.body, { where: { id: id } });
        if (updated) {
            return res.status(200).json(await db.Delivery.findByPk(id));
        }
        throw new Error('Delivery not found');
    } catch (error) { 
        res.status(500).json({ message: 'Error updating delivery', error: error.message }); 
    }
};

exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        if (await db.Delivery.destroy({ where: { id: id } })) {
            return res.status(204).send();
        }
        throw new Error('Delivery not found');
    } catch (error) { 
        res.status(500).json({ message: 'Error deleting delivery', error: error.message }); 
    }
};