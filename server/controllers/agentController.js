/*
 * server/controllers/agentController.js
 */
const { Agent } = require('../models');
exports.getAllAgents = async (req, res) => {
    try { res.status(200).json(await Agent.findAll({ attributes: { exclude: ['password'] } })); } 
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
        if (updated) { return res.status(200).json(await Agent.findByPk(id, { attributes: { exclude: ['password'] } })); }
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
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const agent = await Agent.findOne({ where: { email } });
        if (!agent || !agent.validPassword(password)) {
            return res.status(401).json({ message: "Invalid agent credentials" });
        }
        const token = jwt.sign({ id: agent.id, role: 'Agent' }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token, user: { id: agent.id, name: agent.name, email: agent.email, role: 'Agent' } });
    } catch (error) {
        res.status(500).json({ message: "Error logging in agent", error: error.message });
    }
};