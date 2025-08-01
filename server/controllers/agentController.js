/*
 * server/controllers/agentController.js (UPDATED)
 * This controller now correctly uses the new 'Agent' model.
 */
const { Agent } = require('../models');
exports.getAllAgents = async (req, res) => {
    try { res.status(200).json(await Agent.findAll()); } 
    catch (error) { res.status(500).json({ message: 'Error fetching agents', error: error.message }); }
};
exports.createAgent = async (req, res) => {
    try { res.status(201).json(await Agent.create(req.body)); } 
    catch (error) { res.status(500).json({ message: 'Error creating agent', error: error.message }); }
};
exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Agent.update(req.body, { where: { id: id } });
        if (updated) { return res.status(200).json(await Agent.findByPk(id)); }
        throw new Error('Agent not found');
    } catch (error) { res.status(500).json({ message: 'Error updating agent', error: error.message }); }
};
exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        if (await Agent.destroy({ where: { id: id } })) { return res.status(204).send(); }
        throw new Error('Agent not found');
    } catch (error) { res.status(500).json({ message: 'Error deleting agent', error: error.message }); }
};