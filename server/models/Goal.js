const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    targetWeight: {
      type: Number,
      required: true,
    },
    dailyCalorieGoal: {
      type: Number,
      required: true,
    },
    weeklyWorkoutGoal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);
