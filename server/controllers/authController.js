const db = require('../models');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');

exports.register = async (req, res) => {
    try {
        const { name, email, password, adminCode } = req.body;
        if (adminCode !== secrets.ADMIN_REGISTRATION_CODE) {
            return res.status(403).json({ message: "Invalid Admin Registration Code." });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }
        if (await db.User.findOne({ where: { email } })) {
            return res.status(400).json({ message: "Admin with this email already exists." });
        }
        const newUser = await db.User.create({ name, email, password, role: 'Admin' });
        res.status(201).json({ message: "Admin created successfully", userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: "Error registering admin", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.User.findOne({ where: { email } });
        if (!user || !user.validPassword(password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, secrets.JWT_SECRET, { expiresIn: '24h' });
        const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
        res.status(200).json({ token, user: userData });
    } catch (error) {
        res.status(500).json({ message: "Error logging in admin", error: error.message });
    }
};
