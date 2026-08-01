const express = require('express');
const {
  addWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
} = require('../controllers/workoutController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, addWorkout);
router.get('/', authMiddleware, getWorkouts);
router.put('/:id', authMiddleware, updateWorkout);
router.delete('/:id', authMiddleware, deleteWorkout);

module.exports = router;
