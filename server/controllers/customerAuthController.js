// File: server/controllers/customerAuthController.js (Corrected)
const db = require('../models');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');

exports.register = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body; // Changed 'phone' to 'mobile' to match frontend
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }
        if (await db.Customer.findOne({ where: { email } })) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }
        
        // This create call now perfectly matches your database table columns
        const newCustomer = await db.Customer.create({ 
            name, 
            email, 
            password, 
            mobile // Using 'mobile' from the request body
        });

        res.status(201).json({ message: "Registration successful!", customerId: newCustomer.id });
    } catch (error) {
        res.status(500).json({ message: "Error registering customer", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await db.Customer.findOne({ where: { email } });
        if (!customer || !customer.password || !customer.validPassword(password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const user = { id: customer.id, name: customer.name, email: customer.email, role: 'Customer' };
        const token = jwt.sign(user, secrets.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};