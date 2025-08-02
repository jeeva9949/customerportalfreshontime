// ====================================================
// --- File: server/controllers/supportController.js ---
// ====================================================
const db = require('../models');

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await db.SupportTicket.findAll({ include: [{ model: db.Agent, as: 'agent', attributes: ['id', 'name', 'email'] }], order: [['createdAt', 'DESC']] });
        res.status(200).json(tickets);
    } catch (error) { res.status(500).json({ message: 'Error fetching support tickets', error: error.message }); }
};

exports.createTicket = async (req, res) => {
    try {
        const agentId = req.user.id;
        const { issueType, details } = req.body;
        const newTicket = await db.SupportTicket.create({ agent_id: agentId, issueType, details });
        res.status(201).json(newTicket);
    } catch (error) { res.status(500).json({ message: 'Error creating support ticket', error: error.message }); }
};
