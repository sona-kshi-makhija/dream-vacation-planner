const express = require('express');
const router = express.Router();

const {
  getAllVacations,
  getVacationById,
  createVacation,
  deleteVacation
} = require('../controllers/vacationController');

const { vacationRules, idRule, handleValidation } = require('../middleware/validateVacation');
const { requireAuth } = require('../middleware/auth');

// Every route below requires the caller to be signed in. The controllers
// use req.user.id (set by requireAuth) to make sure people only ever see,
// create, or delete their own trips.
router.use(requireAuth);

// GET    /api/vacations       -> list the signed-in user's vacation plans
// GET    /api/vacations/:id   -> get one of the signed-in user's plans
// POST   /api/vacations       -> create a new vacation plan for the signed-in user
// DELETE /api/vacations/:id   -> delete one of the signed-in user's plans

router.get('/', getAllVacations);
router.get('/:id', idRule, handleValidation, getVacationById);
router.post('/', vacationRules, handleValidation, createVacation);
router.delete('/:id', idRule, handleValidation, deleteVacation);

module.exports = router;
