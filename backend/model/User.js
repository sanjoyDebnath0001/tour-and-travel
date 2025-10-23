// models/userModel.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const { getPool } = require('../config/database');

// Create new user
const createUser = async ({ email, password, role = 'user' }) => {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, role]
    );
};

// Find user by email
const findUserByEmail = async (email) => {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
};

// Match passwords
const matchPassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Generate reset token (and update in DB)
const generateResetToken = async (userId) => {
    const pool = getPool();
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
        'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
        [hashedToken, expires, userId]
    );

    return resetToken;
};

// Generate 2FA secret
const generateTwoFactorSecret = async (userId) => {
    const pool = getPool();
    const secret = speakeasy.generateSecret({ length: 20, name: 'FinanceApp', issuer: 'YourAppName' });

    await pool.query(
        'UPDATE users SET two_factor_secret = ? WHERE id = ?',
        [secret.base32, userId]
    );

    return secret;
};

const ensureAdminUser = async () => {
    const pool = getPool();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    if (rows.length === 0) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await pool.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [adminEmail, hashedPassword, 'admin']
        );
        console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
        console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    matchPassword,
    generateResetToken,
    generateTwoFactorSecret,
    ensureAdminUser,
};
