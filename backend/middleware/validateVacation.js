const { body, param, validationResult } = require('express-validator');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const COMPANIONS = ['Solo', 'Family', 'Friends'];

const vacationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters.'),

  body('destination')
    .trim()
    .notEmpty().withMessage('Dream destination is required.')
    .isLength({ max: 150 }).withMessage('Destination must be under 150 characters.'),

  body('budget')
    .notEmpty().withMessage('Budget is required.')
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number.'),

  body('days')
    .notEmpty().withMessage('Number of days is required.')
    .isInt({ min: 1, max: 365 }).withMessage('Number of days must be between 1 and 365.'),

  body('travel_month')
    .notEmpty().withMessage('Preferred travel month is required.')
    .isIn(MONTHS).withMessage('Please select a valid month.'),

  body('companions')
    .notEmpty().withMessage('Travel companions selection is required.')
    .isIn(COMPANIONS).withMessage('Companions must be Solo, Family, or Friends.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Please add a short description.')
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters.')
];

const idRule = [
  param('id').isInt({ min: 1 }).withMessage('Invalid vacation id.')
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Please fix the highlighted fields.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

module.exports = { vacationRules, idRule, handleValidation };
