const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  calculateBMI,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/bmi', authMiddleware, calculateBMI);

module.exports = router;
