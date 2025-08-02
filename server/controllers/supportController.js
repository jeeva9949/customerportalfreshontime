// ====================================================
// --- File: server/controllers/supportController.js ---
// ====================================================
const db = require('../models');

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await db.SupportTicket.findAll({ 
            include: [{ model: db.Agent, as: 'agent', attributes: ['id', 'name', 'email'] }], 
            order: [['createdAt', 'DESC']] 
        });
        res.status(200).json(tickets);
    } catch (error) { 
        res.status(500).json({ message: 'Error fetching support tickets', error: error.message }); 
    }
};

exports.createTicket = async (req, res) => {
    try {
        const agentId = req.user.id;
        const { issueType, details } = req.body;
        const newTicket = await db.SupportTicket.create({ agent_id: agentId, issueType, details });
        res.status(201).json(newTicket);
    } catch (error) { 
        res.status(500).json({ message: 'Error creating support ticket', error: error.message }); 
    }
};

// This function handles updating the ticket status to "Resolved"
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const [updated] = await db.SupportTicket.update({ status }, { where: { id: id } });
        if (updated) {
            const updatedTicket = await db.SupportTicket.findByPk(id);
            return res.status(200).json(updatedTicket);
        }
        throw new Error('Support ticket not found');
    } catch (error) {
        res.status(500).json({ message: 'Error updating support ticket', error: error.message });
    }
};