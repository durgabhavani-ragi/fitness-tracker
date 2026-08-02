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
            <div className="empty-icon text-primary mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
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
          <Link to="/goals" className="btn btn-primary flex-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Edit Goals
          </Link>
        </div>

        <div className="grid grid-3 saved-goals-grid mt-6">
          {/* Target Weight Card */}
          <div className="card saved-goal-card hover-lift">
            <div className="goal-card-header">
              <div className="stat-icon icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
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
              <div className="stat-icon icon-pink">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.7-2.5-3.5-2.5-3.5s-2.5 1.8-2.5 3.5Z"/><path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10c0 4.5-3.5 8-8 8a8 8 0 0 1-5.5-2.2C4.5 17.5 7 22 12 22c5.5 0 10-4.5 10-10 0-4-2.5-7.5-6-9-1.5 2.5-2.5 3.5-4 1Z"/></svg>
              </div>
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
              <div className="stat-icon icon-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
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
