require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { testConnection } = require('./config/db');
const vacationRoutes = require('./routes/vacations');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger (handy when tailing logs on the EC2 instance)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Dream Vacation Planner API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vacations', vacationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Central error handler (catches anything thrown/rejected in routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Dream Vacation Planner API listening on port ${PORT}`);
  testConnection();
});
