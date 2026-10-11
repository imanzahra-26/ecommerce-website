// ============================================
// AUTH ROUTES — register, login, me
// ============================================

// Load .env for JWT_SECRET and JWT_EXPIRES_IN
require('dotenv').config();

// Express router — lets us define routes in this file
const express = require('express');
const router = express.Router();

// bcrypt for password hashing
const bcrypt = require('bcrypt');

// jsonwebtoken for creating login tokens
const jwt = require('jsonwebtoken');

// Our MySQL pool
const pool = require('../config/db');

// Our auth middleware — used to protect the /me route
const authMiddleware = require('../middleware/auth');

// ============================================
// HELPER: generate a JWT for a user
// ============================================
// Used by both register and login so we don't repeat code.
const generateToken = (user) => {
  // Sign a token containing: id, role. Signed with JWT_SECRET, expires per .env
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// ============================================
// POST /api/auth/register
// ============================================
// Body: { name, email, password }
// Creates a new user, returns a token (auto-login after register)
router.post('/register', async (req, res) => {
  try {
    // 1. Pull values from the request body
    const { name, email, password } = req.body;

    // 2. Validate — all three are required
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // 3. Check if the email is already taken
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 4. Hash the password (10 rounds = good balance of speed & safety)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Insert the new user (role defaults to 'user' in DB)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // 6. Build a minimal user object to return (NEVER return the password!)
    const newUser = {
      id: result.insertId,       // MySQL gives us the new row's id
      name,
      email,
      role: 'user'
    };

    // 7. Sign a token so the frontend can keep them logged in
    const token = generateToken(newUser);

    // 8. Send back user + token
    res.status(201).json({ user: newUser, token });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ============================================
// POST /api/auth/login
// ============================================
// Body: { email, password }
// Checks credentials, returns a token
router.post('/login', async (req, res) => {
  try {
    // 1. Read body
    const { email, password } = req.body;

    // 2. Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 3. Find the user by email
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    // 4. If no user found, fail (same message for wrong email OR password — safety)
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // 5. Compare typed password with the hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 6. Build a safe user object (NO password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // 7. Sign a token
    const token = generateToken(safeUser);

    // 8. Respond
    res.json({ user: safeUser, token });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ============================================
// GET /api/auth/me  (PROTECTED)
// ============================================
// Uses authMiddleware to check the token, then returns the user's row.
// Frontend uses this on page reload to restore the logged-in user.
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user.id was set by the middleware after verifying the token
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the router so server.js can mount it
module.exports = router;