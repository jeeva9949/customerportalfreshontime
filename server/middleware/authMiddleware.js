const jwt = require('jsonwebtoken');
const { User, Agent, Customer } = require('../models'); // Assuming User model is for Admins
const { JWT_SECRET } = require('../config/secrets');

/**
 * Middleware to protect routes.
 * Verifies the JWT token from the Authorization header, identifies the user's role,
 * and attaches the user's data (without password) to the request object.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Find the user in the database based on the role stored in the token
            if (decoded.role === 'Admin') {
                req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
            } else if (decoded.role === 'Agent') {
                req.user = await Agent.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
            } else {
                req.user = await Customer.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
            }
            
            // Check if user still exists
            if (!req.user) {
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach the role to the user object for easy access in subsequent middleware/controllers
            req.user.role = decoded.role; 
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Middleware to authorize admin roles.
 * This should be used after the `protect` middleware on any route
 * that should only be accessible to administrators.
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, isAdmin };
