import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const [data, setData] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, workoutsRes] = await Promise.all([
        API.get('/dashboard'),
        API.get('/workouts').catch(() => ({ data: { workouts: [] } })),
      ]);

      setData(dashRes.data);
      setRecentWorkouts((workoutsRes.data.workouts || []).slice(0, 3));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getBMIBadgeClass = (category) => {
    switch (category) {
      case 'Normal Weight':
        return 'badge-success';
      case 'Underweight':
      case 'Overweight':
        return 'badge-warning';
      case 'Obese':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container page-content">
          <div className="loader-container">
            <div className="spinner-large"></div>
            <p>Loading your fitness metrics...</p>
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
          <button onClick={fetchDashboard} className="btn btn-primary mt-4">
            Retry
          </button>
        </div>
      </>
    );
  }

  const { profile, bmi, goals, summary } = data || {};

  // Goal Progress Calculation
  const targetWorkouts = goals?.weeklyWorkoutGoal || 5;
  const currentWorkouts = summary?.totalWorkouts || 0;
  const goalProgressPercentage = Math.min(
    100,
    Math.round((currentWorkouts / targetWorkouts) * 100)
  );

  const barChartData = {
    labels: ['Duration (mins)', 'Calories (kcal)', 'Workouts (x10)'],
    datasets: [
      {
        label: 'Activity Stats',
        data: [
          summary?.totalWorkoutDuration || 0,
          summary?.totalCaloriesBurned || 0,
          (summary?.totalWorkouts || 0) * 10,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: ['#3b82f6', '#ec4899', '#10b981'],
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: ['Completed Workouts', 'Remaining Goal'],
    datasets: [
      {
        data: [
          currentWorkouts,
          Math.max(0, targetWorkouts - currentWorkouts),
        ],
        backgroundColor: ['rgba(59, 130, 246, 0.85)', 'rgba(100, 116, 139, 0.25)'],
        borderColor: ['#3b82f6', '#64748b'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        {/* Welcome Header */}
        <div className="page-header flex-between flex-wrap gap-4">
          <div>
            <h1>Dashboard Overview</h1>
            <p className="subtitle">
              Welcome back, <strong>{profile?.name || 'Athlete'}</strong>! Track your targets & stats below.
            </p>
          </div>
          <a href="/workouts" className="btn btn-primary">
            + Log New Workout
          </a>
        </div>

        {/* 5 Summary Cards Grid */}
        <div className="dashboard-summary-grid mt-4">
          {/* Card 1: BMI */}
          <div className="card summary-card hover-lift">
            <div className="stat-icon icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"/></svg>
            </div>
            <div className="stat-details">
              <span className="stat-label">BMI Score</span>
              <div className="stat-value-group">
                <h2 className="stat-value">
                  {bmi?.value !== undefined && bmi?.value !== null
                    ? bmi.value
                    : 'N/A'}
                </h2>
                {bmi?.category && (
                  <span className={`badge ${getBMIBadgeClass(bmi.category)}`}>
                    {bmi.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Total Workouts */}
          <div className="card summary-card hover-lift">
            <div className="stat-icon icon-indigo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h20M4 9v6M20 9v6M8 6.5v11M16 6.5v11"/></svg>
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Workouts</span>
              <h2 className="stat-value">{summary?.totalWorkouts || 0}</h2>
              <span className="stat-subtext">Completed Sessions</span>
            </div>
          </div>

          {/* Card 3: Calories Burned */}
          <div className="card summary-card hover-lift">
            <div className="stat-icon icon-pink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.7-2.5-3.5-2.5-3.5s-2.5 1.8-2.5 3.5Z"/><path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10c0 4.5-3.5 8-8 8a8 8 0 0 1-5.5-2.2C4.5 17.5 7 22 12 22c5.5 0 10-4.5 10-10 0-4-2.5-7.5-6-9-1.5 2.5-2.5 3.5-4 1Z"/></svg>
            </div>
            <div className="stat-details">
              <span className="stat-label">Calories Burned</span>
              <h2 className="stat-value">
                {summary?.totalCaloriesBurned || 0}{' '}
                <span className="unit">kcal</span>
              </h2>
              <span className="stat-subtext">Total Energy Output</span>
            </div>
          </div>

          {/* Card 4: Workout Duration */}
          <div className="card summary-card hover-lift">
            <div className="stat-icon icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="stat-details">
              <span className="stat-label">Workout Duration</span>
              <h2 className="stat-value">
                {summary?.totalWorkoutDuration || 0}{' '}
                <span className="unit">mins</span>
              </h2>
              <span className="stat-subtext">
                {Math.round((summary?.totalWorkoutDuration || 0) / 60)} hrs active
              </span>
            </div>
          </div>

          {/* Card 5: Goal Progress */}
          <div className="card summary-card hover-lift card-highlight">
            <div className="stat-icon icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <div className="stat-details w-100">
              <div className="flex-between">
                <span className="stat-label">Goal Progress</span>
                <strong className="text-primary">{goalProgressPercentage}%</strong>
              </div>
              <h2 className="stat-value mt-1">
                {currentWorkouts}/{targetWorkouts}{' '}
                <span className="unit">workouts</span>
              </h2>
              <div className="progress-bar-bg mt-2">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${goalProgressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-2 mt-6">
          {/* Performance Bar Chart */}
          <div className="card hover-lift">
            <div className="card-header flex-between mb-4">
              <h3>Activity Breakdown</h3>
              <span className="badge badge-info">Overview</span>
            </div>
            <div style={{ height: '260px', position: 'relative' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(125,125,125,0.1)' } },
                  },
                }}
              />
            </div>
          </div>

          {/* Goal Doughnut Progress */}
          <div className="card hover-lift">
            <div className="card-header flex-between mb-4">
              <h3>Weekly Target Completion</h3>
              <span className="badge badge-success">Target</span>
            </div>
            <div
              style={{
                height: '260px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8' },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Workouts Activity List */}
        <div className="card hover-lift mt-6">
          <div className="flex-between mb-4">
            <h3>Recent Workouts</h3>
            <a href="/workouts" className="btn btn-sm btn-outline">
              View All Workouts →
            </a>
          </div>

          {recentWorkouts.length === 0 ? (
            <p className="text-muted text-center p-4">No recent workouts logged yet.</p>
          ) : (
            <div className="recent-workouts-list">
              {recentWorkouts.map((workout) => (
                <div key={workout._id} className="recent-workout-item flex-between p-3 border-top">
                  <div className="flex-center gap-3">
                    <div className="stat-icon icon-purple" style={{ width: '42px', height: '42px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h20M4 9v6M20 9v6M8 6.5v11M16 6.5v11"/></svg>
                    </div>
                    <div>
                      <strong className="d-block">{workout.workoutName}</strong>
                      <small className="text-muted">{workout.category} • {new Date(workout.date).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="d-block font-weight-bold">{workout.duration} mins</span>
                    <small className="text-pink">{workout.caloriesBurned} kcal</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
