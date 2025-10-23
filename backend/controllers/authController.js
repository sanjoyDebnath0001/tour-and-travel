// controllers/authController.js
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper for basic email validation
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// --- User Registration ---
exports.userRegister = async (req, res) => {
  const { name, email, password } = req.body;

  // Manual Validation
  if (!name || !email || !password || password.length < 6 || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid input. Name, valid email, and password (min 6 chars) are required.' });
  }
  
  try {
    const [existingUsers] = await pool.execute('SELECT id FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, "user")',
      [name, email, hashedPassword]
    );

    const token = generateToken({ id: result.insertId, email, role: 'user' });
    res.status(201).json({ token, role: 'user', name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// --- User Login ---
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  
  // Manual Validation
  if (!email || !password || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid input. Valid email and password are required.' });
  }

  try {
    const [users] = await pool.execute('SELECT * FROM Users WHERE email = ? AND role = "user"', [email]);
    const user = users[0];
    if (!user) return res.status(400).json({ error: 'Invalid Credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials.' });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// --- Admin Login (Hardcoded) ---
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Manual Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid Admin Credentials.' });
  }

  const token = generateToken({ 
      id: 0, 
      email: process.env.ADMIN_EMAIL, 
      role: 'admin' 
  });
  
  res.json({ token, role: 'admin' });
};