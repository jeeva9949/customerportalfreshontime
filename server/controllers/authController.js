/*
 * server/controllers/authController.js
 */
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

exports.register = async (req, res) => {
    try {
        const { name, email, password, role = 'Admin' } = req.body;
        if (!password || password.length < 6) { return res.status(400).json({ message: "Password must be at least 6 characters long." }); }
        if (await User.findOne({ where: { email } })) { return res.status(400).json({ message: "User with this email already exists." }); }
        const newUser = await User.create({ name, email, password, role });
        res.status(201).json({ message: "User created successfully", userId: newUser.id });
    } catch (error) { res.status(500).json({ message: "Error registering user", error: error.message }); }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || !user.validPassword(password)) { return res.status(401).json({ message: "Invalid credentials" }); }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) { res.status(500).json({ message: "Error logging in", error: error.message }); }
};