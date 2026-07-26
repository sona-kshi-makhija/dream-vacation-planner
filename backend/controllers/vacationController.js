const { pool } = require('../config/db');

// GET /api/vacations
// Returns only the signed-in user's submitted vacation plans, newest first.
async function getAllVacations(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, destination, budget, days, travel_month, companions, description, created_at
       FROM vacations WHERE user_id = :userId ORDER BY created_at DESC`,
      { userId: req.user.id }
    );
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching vacations:', err.message);
    res.status(500).json({ success: false, message: 'Could not fetch vacation plans. Please try again later.' });
  }
}

// GET /api/vacations/:id
async function getVacationById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM vacations WHERE id = :id AND user_id = :userId',
      { id, userId: req.user.id }
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vacation plan not found.' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching vacation:', err.message);
    res.status(500).json({ success: false, message: 'Could not fetch the vacation plan.' });
  }
}

// POST /api/vacations
// Creates a new vacation plan owned by the signed-in user.
async function createVacation(req, res) {
  try {
    const { name, destination, budget, days, travel_month, companions, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO vacations (user_id, name, destination, budget, days, travel_month, companions, description)
       VALUES (:userId, :name, :destination, :budget, :days, :travel_month, :companions, :description)`,
      { userId: req.user.id, name, destination, budget, days, travel_month, companions, description }
    );

    const [rows] = await pool.query(
      'SELECT * FROM vacations WHERE id = :id AND user_id = :userId',
      { id: result.insertId, userId: req.user.id }
    );

    res.status(201).json({
      success: true,
      message: 'Your dream vacation plan has been saved!',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error creating vacation:', err.message);
    res.status(500).json({ success: false, message: 'Could not save your vacation plan. Please try again.' });
  }
}

// DELETE /api/vacations/:id
async function deleteVacation(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'DELETE FROM vacations WHERE id = :id AND user_id = :userId',
      { id, userId: req.user.id }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vacation plan not found.' });
    }
    res.status(200).json({ success: true, message: 'Vacation plan deleted.' });
  } catch (err) {
    console.error('Error deleting vacation:', err.message);
    res.status(500).json({ success: false, message: 'Could not delete the vacation plan.' });
  }
}

module.exports = { getAllVacations, getVacationById, createVacation, deleteVacation };
