const express = require('express');
const { setGoal } = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, setGoal);

module.exports = router;
