const express = require('express');
const router = express.Router();

const { signup, login, me } = require('../controllers/authController');
const { signupRules, loginRules, handleValidation } = require('../middleware/validateAuth');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', signupRules, handleValidation, signup);
router.post('/login', loginRules, handleValidation, login);
router.get('/me', requireAuth, me);

module.exports = router;
