const express = require('express');
const { setGoal, getGoal } = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getGoal);
router.post('/', authMiddleware, setGoal);

module.exports = router;

