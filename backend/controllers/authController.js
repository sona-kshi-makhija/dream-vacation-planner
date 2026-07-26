const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = :email', { email });
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with that email already exists. Try signing in instead.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :passwordHash)',
      { name, email, passwordHash }
    );

    const user = { id: result.insertId, name, email };
    const token = issueToken(user);

    res.status(201).json({ success: true, message: 'Account created.', token, user });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: 'Could not create your account. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = :email',
      { email }
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    const dbUser = rows[0];
    const passwordMatches = await bcrypt.compare(password, dbUser.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
    const token = issueToken(user);

    res.status(200).json({ success: true, message: 'Signed in.', token, user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Could not sign you in. Please try again.' });
  }
}

// GET /api/auth/me  (requires requireAuth middleware)
async function me(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = :id',
      { id: req.user.id }
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Fetch current user error:', err.message);
    res.status(500).json({ success: false, message: 'Could not load your profile.' });
  }
}

module.exports = { signup, login, me };
