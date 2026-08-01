const Workout = require('../models/Workout');

const addWorkout = async (req, res) => {
  try {
    const { workoutName, category, duration, caloriesBurned, date } = req.body;

    if (!workoutName?.trim() || !category?.trim() || duration === undefined || caloriesBurned === undefined) {
      return res.status(400).json({
        message: 'workoutName, category, duration, and caloriesBurned are required',
      });
    }

    const workoutData = {
      user: req.user.id,
      workoutName: workoutName.trim(),
      category: category.trim(),
      duration: Number(duration),
      caloriesBurned: Number(caloriesBurned),
    };

    if (date) {
      workoutData.date = date;
    }

    const workout = await Workout.create(workoutData);

    res.status(201).json({
      message: 'Workout added successfully',
      workout,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: 'Server error while adding workout',
    });
  }
};

const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      count: workouts.length,
      workouts,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching workouts',
    });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { workoutName, category, duration, caloriesBurned } = req.body;

    const workout = await Workout.findOne({ _id: id, user: req.user.id });

    if (!workout) {
      return res.status(404).json({
        message: 'Workout not found or unauthorized',
      });
    }

    if (workoutName !== undefined) workout.workoutName = workoutName.trim();
    if (category !== undefined) workout.category = category.trim();
    if (duration !== undefined) workout.duration = Number(duration);
    if (caloriesBurned !== undefined) workout.caloriesBurned = Number(caloriesBurned);

    await workout.save();

    res.status(200).json({
      message: 'Workout updated successfully',
      workout,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid workout ID',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: 'Server error while updating workout',
    });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    const workout = await Workout.findOneAndDelete({ _id: id, user: req.user.id });

    if (!workout) {
      return res.status(404).json({
        message: 'Workout not found or unauthorized',
      });
    }

    res.status(200).json({
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid workout ID',
      });
    }

    res.status(500).json({
      message: 'Server error while deleting workout',
    });
  }
};

module.exports = { addWorkout, getWorkouts, updateWorkout, deleteWorkout };
