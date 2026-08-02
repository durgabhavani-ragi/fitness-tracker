const Goal = require('../models/Goal');

const setGoal = async (req, res) => {
  try {
    const { targetWeight, dailyCalorieGoal, weeklyWorkoutGoal } = req.body;

    if (targetWeight === undefined || dailyCalorieGoal === undefined || weeklyWorkoutGoal === undefined) {
      return res.status(400).json({
        message: 'targetWeight, dailyCalorieGoal, and weeklyWorkoutGoal are required',
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { user: req.user.id },
      {
        user: req.user.id,
        targetWeight: Number(targetWeight),
        dailyCalorieGoal: Number(dailyCalorieGoal),
        weeklyWorkoutGoal: Number(weeklyWorkoutGoal),
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Goals saved successfully',
      goal,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: 'Server error while saving goals',
    });
  }
};

const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user.id });
    if (!goal) {
      return res.status(200).json({
        message: 'No goals saved yet.',
      });
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching goals',
    });
  }
};

module.exports = { setGoal, getGoal };

