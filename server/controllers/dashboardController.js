const User = require('../models/User');
const Goal = require('../models/Goal');
const Workout = require('../models/Workout');

const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const goal = await Goal.findOne({ user: req.user.id });
    const workouts = await Workout.find({ user: req.user.id });

    // Calculate Summary
    const totalWorkouts = workouts.length;
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalWorkoutDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    // Calculate BMI
    let bmiData = null;
    if (user.height && user.weight && user.height > 0 && user.weight > 0) {
      const heightInMeters = user.height / 100;
      const bmiRaw = user.weight / (heightInMeters * heightInMeters);
      const bmiValue = Number(bmiRaw.toFixed(2));

      let category = '';
      if (bmiValue < 18.5) {
        category = 'Underweight';
      } else if (bmiValue <= 24.9) {
        category = 'Normal Weight';
      } else if (bmiValue <= 29.9) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }

      bmiData = {
        value: bmiValue,
        category,
      };
    }

    res.status(200).json({
      profile: {
        name: user.name,
        height: user.height,
        weight: user.weight,
      },
      bmi: bmiData,
      goals: goal
        ? {
            targetWeight: goal.targetWeight,
            dailyCalorieGoal: goal.dailyCalorieGoal,
            weeklyWorkoutGoal: goal.weeklyWorkoutGoal,
          }
        : null,
      summary: {
        totalWorkouts,
        totalCaloriesBurned,
        totalWorkoutDuration,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching dashboard data',
    });
  }
};

module.exports = { getDashboardData };
