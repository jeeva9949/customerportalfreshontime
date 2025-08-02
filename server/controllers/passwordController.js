// ====================================================
// --- File: server/controllers/passwordController.js (NEW) ---
// ====================================================
const db = require('../models');

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await db.PasswordRequest.findAll({ 
            include: [{ model: db.Agent, as: 'agent', attributes: ['id', 'name', 'email'] }], 
            order: [['createdAt', 'DESC']] 
        });
        res.status(200).json(requests);
    } catch (error) { 
        res.status(500).json({ message: 'Error fetching password requests', error: error.message }); 
    }
};

exports.createRequest = async (req, res) => {
    try {
        const agentId = req.user.id;
        const { newPassword } = req.body;
        const newRequest = await db.PasswordRequest.create({ agent_id: agentId, new_password: newPassword });
        res.status(201).json(newRequest);
    } catch (error) { 
        res.status(500).json({ message: 'Error creating password request', error: error.message }); 
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await db.PasswordRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        // Note: The password in the request is plain text. The model hook will hash it.
        await db.Agent.update({ password: request.new_password }, { 
            where: { id: request.agent_id },
            individualHooks: true // This is crucial to trigger the beforeUpdate hook for hashing
        });
        await request.update({ status: 'Approved' });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving password request', error: error.message });
    }
};