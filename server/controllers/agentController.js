const db = require('../models');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');
const { getIO } = require('../socket');

exports.getAllAgents = async (req, res) => {
    try {
        const agents = await db.Agent.findAll({ attributes: { exclude: ['password'] } });
        res.status(200).json(agents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching agents', error: error.message });
    }
};

exports.createAgent = async (req, res) => {
    try {
        const newAgent = await db.Agent.create(req.body);
        const agentData = newAgent.toJSON();
        delete agentData.password;
        getIO().emit('agents_updated');
        res.status(201).json(agentData);
    } catch (error) {
        res.status(500).json({ message: 'Error creating agent', error: error.message });
    }
};

exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Agent.update(req.body, { where: { id: id } });
        if (updated) {
            const updatedAgent = await db.Agent.findByPk(id, { attributes: { exclude: ['password'] } });
            getIO().emit('agents_updated');
            return res.status(200).json(updatedAgent);
        }
        throw new Error('Agent not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating agent', error: error.message });
    }
};

exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Agent.destroy({ where: { id: id } });
        if (deleted) {
            getIO().emit('agents_updated');
            return res.status(204).send();
        }
        throw new Error('Agent not found');
    } catch (error) {
        res.status(500).json({ message: 'Error deleting agent', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const agent = await db.Agent.findOne({ where: { email } });
        if (!agent || !agent.validPassword(password)) {
            return res.status(401).json({ message: "Invalid agent credentials" });
        }
        const token = jwt.sign({ id: agent.id, role: 'Agent' }, secrets.JWT_SECRET, { expiresIn: '24h' });
        const user = { id: agent.id, name: agent.name, email: agent.email, role: 'Agent' };
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error logging in agent", error: error.message });
    }
};

// --- THIS FUNCTION IS NOW CORRECTLY EXPORTED ---
exports.updateNotificationPreference = async (req, res) => {
    try {
        const agentId = req.user.id;
        const { notifications_enabled } = req.body;
        const [updated] = await db.Agent.update({ notifications_enabled }, { where: { id: agentId } });
        if (updated) {
            return res.status(200).json({ message: 'Notification preference updated.' });
        }
        throw new Error('Agent not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification preference', error: error.message });
    }
};