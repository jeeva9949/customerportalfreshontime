// ====================================================
// --- File: server/config/secrets.js ---
// ====================================================
// In a real project, use environment variables (.env file)
module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-for-jwt',
    ADMIN_REGISTRATION_CODE: process.env.ADMIN_REGISTRATION_CODE || 'FRESHONTIME_ADMIN_2025'
};

