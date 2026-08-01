import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';

function Goals() {
  const [formData, setFormData] = useState({
    targetWeight: '',
    dailyCalorieGoal: '',
    weeklyWorkoutGoal: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await API.get('/dashboard');
      if (response.data.goals) {
        setFormData({
          targetWeight: response.data.goals.targetWeight || '',
          dailyCalorieGoal: response.data.goals.dailyCalorieGoal || '',
          weeklyWorkoutGoal: response.data.goals.weeklyWorkoutGoal || '',
        });
      }
    } catch (err) {
      // Ignore error if goals not set yet
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        targetWeight: Number(formData.targetWeight),
        dailyCalorieGoal: Number(formData.dailyCalorieGoal),
        weeklyWorkoutGoal: Number(formData.weeklyWorkoutGoal),
      };

      await API.post('/goals', payload);
      setSuccess('Goals saved successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save goals. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header">
          <h1>Goal Setting</h1>
          <p className="subtitle">
            Define your targets and track your personal growth
          </p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loader-container">
            <div className="spinner-large"></div>
            <p>Loading your goals...</p>
          </div>
        ) : (
          <div className="grid grid-2">
            <div className="card">
              <h2>Set / Update Goals</h2>
              <p className="text-muted mb-4">
                Enter your desired weight, daily calorie burn target, and weekly workouts target.
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="targetWeight">Target Weight (kg) *</label>
                  <input
                    type="number"
                    id="targetWeight"
                    name="targetWeight"
                    placeholder="e.g. 65"
                    value={formData.targetWeight}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dailyCalorieGoal">Daily Calorie Burn Target (kcal) *</label>
                  <input
                    type="number"
                    id="dailyCalorieGoal"
                    name="dailyCalorieGoal"
                    placeholder="e.g. 2000"
                    value={formData.dailyCalorieGoal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weeklyWorkoutGoal">Weekly Workout Target (sessions) *</label>
                  <input
                    type="number"
                    id="weeklyWorkoutGoal"
                    name="weeklyWorkoutGoal"
                    placeholder="e.g. 5"
                    value={formData.weeklyWorkoutGoal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block mt-4"
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner"></span> : 'Save Goals'}
                </button>
              </form>
            </div>

            <div className="card flex-column flex-center text-center">
              <div className="goal-illustration">🎯</div>
              <h3>Why Set Goals?</h3>
              <p className="text-muted mt-2">
                Setting clear, measurable targets keeps you motivated and provides a roadmap for your weekly workout discipline.
              </p>
              <div className="tips-list text-left mt-4">
                <div className="tip-item">✨ Consistency is key</div>
                <div className="tip-item">✨ Track daily calories to maintain deficit/surplus</div>
                <div className="tip-item">✨ Adjust weekly goals as your fitness improves</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Goals;
