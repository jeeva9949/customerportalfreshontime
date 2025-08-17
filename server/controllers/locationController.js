const db = require('../models');

/**
 * @description Get the latest known locations for all agents.
 * @route GET /api/locations/agents
 */
exports.getAgentLocations = async (req, res) => {
    try {
        const locations = await db.agent_location.findAll({
            include: [{
                model: db.Agent,
                as: 'agent',
                attributes: ['id', 'name', 'email', 'mobile']
            }]
        });
        res.status(200).json(locations);
    } catch (error) {
        console.error("Error fetching agent locations:", error);
        res.status(500).json({ message: 'Error fetching agent locations', error: error.message });
    }
};
