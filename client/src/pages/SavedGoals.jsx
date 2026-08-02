import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';

function SavedGoals() {
  const [goal, setGoal] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedGoals();
  }, []);

  const fetchSavedGoals = async () => {
    try {
      setLoading(true);
      setError('');

      const [goalsRes, dashRes] = await Promise.all([
        API.get('/goals'),
        API.get('/dashboard').catch(() => ({ data: null })),
      ]);

      if (goalsRes.data && goalsRes.data.targetWeight !== undefined) {
        setGoal(goalsRes.data);
      } else if (goalsRes.data && goalsRes.data.message === 'No goals saved yet.') {
        setGoal(null);
      } else {
        setGoal(null);
      }

      if (dashRes.data) {
        setDashboardData(dashRes.data);
      }
    } catch (err) {
      if (err.response?.data?.message === 'No goals saved yet.') {
        setGoal(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load saved goals.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container page-content">
          <div className="loader-container">
            <div className="spinner-large"></div>
            <p>Loading your saved goals...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container page-content">
          <div className="alert alert-error">{error}</div>
          <button onClick={fetchSavedGoals} className="btn btn-primary mt-4">
            Retry
          </button>
        </div>
      </>
    );
  }

  // Check if goal is empty/null
  if (!goal) {
    return (
      <>
        <Navbar />
        <div className="container page-content">
          <div className="page-header flex-between align-center">
            <div>
              <h1>Saved Goals</h1>
              <p className="subtitle">Review your active fitness targets</p>
            </div>
            <Link to="/goals" className="btn btn-primary">
              Set Goals
            </Link>
          </div>

          <div className="card text-center p-8 mt-6 empty-state-card hover-lift">
            <div className="empty-icon" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
              🎯
            </div>
            <h2 className="empty-title">No goals saved yet.</h2>
            <p className="text-muted mt-2 mb-6" style={{ maxWidth: '480px', margin: '0.75rem auto 1.5rem' }}>
              Set your target weight, daily calorie burn, and weekly workout goals to track your personal growth.
            </p>
            <Link to="/goals" className="btn btn-primary btn-lg">
              Edit Goals
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Metrics calculation
  const currentWeight = dashboardData?.profile?.weight;
  const currentCalories = dashboardData?.summary?.totalCaloriesBurned || 0;
  const currentWorkouts = dashboardData?.summary?.totalWorkouts || 0;

  // 1. Target Weight calculations
  const targetWeight = goal.targetWeight;
  let weightDisplay = `${targetWeight} kg`;
  let weightPercent = 100;
  if (currentWeight) {
    weightDisplay = `${currentWeight} kg → ${targetWeight} kg`;
    if (currentWeight === targetWeight) {
      weightPercent = 100;
    } else {
      // Calculate progress percentage towards goal
      const diff = Math.abs(currentWeight - targetWeight);
      const startEst = Math.max(currentWeight, targetWeight + 10);
      const totalDist = Math.abs(startEst - targetWeight);
      const achieved = Math.max(0, totalDist - diff);
      weightPercent = Math.min(100, Math.max(10, Math.round((achieved / totalDist) * 100)));
    }
  }

  // 2. Daily Calories calculations
  const dailyCalorieGoal = goal.dailyCalorieGoal;
  const caloriesDisplay = `${currentCalories} / ${dailyCalorieGoal} kcal`;
  const caloriesPercent = Math.min(100, Math.round((currentCalories / dailyCalorieGoal) * 100));

  // 3. Weekly Workout calculations
  const weeklyWorkoutGoal = goal.weeklyWorkoutGoal;
  const workoutsDisplay = `${currentWorkouts} / ${weeklyWorkoutGoal}`;
  const workoutsPercent = Math.min(100, Math.round((currentWorkouts / weeklyWorkoutGoal) * 100));

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header flex-between align-center">
          <div>
            <h1>Saved Goals</h1>
            <p className="subtitle">
              Monitor your active health targets and completion progress
            </p>
          </div>
          <Link to="/goals" className="btn btn-primary">
            ✏️ Edit Goals
          </Link>
        </div>

        <div className="grid grid-3 saved-goals-grid mt-6">
          {/* Target Weight Card */}
          <div className="card saved-goal-card hover-lift">
            <div className="goal-card-header">
              <div className="stat-icon icon-purple">🎯</div>
              <div className="goal-header-text">
                <span className="stat-label">Target Weight</span>
                <h3 className="goal-value mt-1">{weightDisplay}</h3>
              </div>
            </div>

            <div className="goal-progress-section mt-5">
              <div className="progress-info flex-between mb-2">
                <span className="text-muted text-sm">Progress</span>
                <span className="progress-percentage font-semibold text-primary">
                  {weightPercent}%
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill fill-blue"
                  style={{ width: `${weightPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Daily Calories Goal Card */}
          <div className="card saved-goal-card hover-lift">
            <div className="goal-card-header">
              <div className="stat-icon icon-pink">🔥</div>
              <div className="goal-header-text">
                <span className="stat-label">Daily Calories Goal</span>
                <h3 className="goal-value mt-1">{caloriesDisplay}</h3>
              </div>
            </div>

            <div className="goal-progress-section mt-5">
              <div className="progress-info flex-between mb-2">
                <span className="text-muted text-sm">Progress</span>
                <span className="progress-percentage font-semibold text-pink">
                  {caloriesPercent}%
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill fill-pink"
                  style={{ width: `${caloriesPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Weekly Workout Goal Card */}
          <div className="card saved-goal-card hover-lift">
            <div className="goal-card-header">
              <div className="stat-icon icon-green">📅</div>
              <div className="goal-header-text">
                <span className="stat-label">Weekly Workout Goal</span>
                <h3 className="goal-value mt-1">{workoutsDisplay}</h3>
              </div>
            </div>

            <div className="goal-progress-section mt-5">
              <div className="progress-info flex-between mb-2">
                <span className="text-muted text-sm">Progress</span>
                <span className="progress-percentage font-semibold text-green">
                  {workoutsPercent}%
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill fill-green"
                  style={{ width: `${workoutsPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Card Footer */}
        <div className="mt-8 text-center">
          <Link to="/goals" className="btn btn-outline btn-lg">
            Update Goals & Targets
          </Link>
        </div>
      </div>
    </>
  );
}

export default SavedGoals;
