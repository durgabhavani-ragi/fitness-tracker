import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Progress() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/workouts');
      setWorkouts(response.data.workouts || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch workout progress data.'
      );
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
            <p>Analyzing workout analytics...</p>
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
          <button onClick={fetchWorkouts} className="btn btn-primary mt-4">
            Retry
          </button>
        </div>
      </>
    );
  }

  if (workouts.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container page-content">
          <div className="page-header">
            <h1>Progress & Analytics</h1>
            <p className="subtitle">Visual performance graphs and insights</p>
          </div>
          <div className="card text-center p-8 mt-4">
            <div className="empty-icon" style={{ fontSize: '3rem' }}>
              📊
            </div>
            <h3 className="mt-2">No Workout Data Available</h3>
            <p className="text-muted">
              Log your exercises to unlock duration, calories burned, and category analytics graphs.
            </p>
            <a href="/workouts" className="btn btn-primary mt-4">
              Log Your First Workout
            </a>
          </div>
        </div>
      </>
    );
  }

  // Prepare Data for Charts

  // Sort workouts chronologically (oldest to newest for progression graphs)
  const chronologicalWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const labels = chronologicalWorkouts.map((w) =>
    new Date(w.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  );

  // 1. Duration Bar Chart Data
  const durationBarData = {
    labels: chronologicalWorkouts.map(
      (w, i) => `${w.workoutName} (${labels[i]})`
    ),
    datasets: [
      {
        label: 'Duration (mins)',
        data: chronologicalWorkouts.map((w) => w.duration),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1.5,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(129, 140, 248, 0.9)',
      },
    ],
  };

  // 2. Calories Line Chart Data
  const caloriesLineData = {
    labels: chronologicalWorkouts.map((w, i) => `${labels[i]} - ${w.workoutName}`),
    datasets: [
      {
        label: 'Calories Burned (kcal)',
        data: chronologicalWorkouts.map((w) => w.caloriesBurned),
        fill: true,
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        borderColor: '#ec4899',
        borderWidth: 3,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  // 3. Category Pie Chart Data
  const categoryCounts = workouts.reduce((acc, w) => {
    const cat = w.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryLabels = Object.keys(categoryCounts);
  const categoryValues = Object.values(categoryCounts);

  const categoryPieData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          '#6366f1',
          '#ec4899',
          '#10b981',
          '#f59e0b',
          '#3b82f6',
          '#8b5cf6',
        ],
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header">
          <h1>Progress & Analytics</h1>
          <p className="subtitle">
            Visual representations of your training sessions and energy burn
          </p>
        </div>

        {/* Top 2 Charts: Bar & Line */}
        <div className="grid grid-2">
          {/* Bar Chart */}
          <div className="card">
            <h3>⏱️ Workout Duration</h3>
            <p className="text-muted text-sm mb-4">
              Duration per session in minutes
            </p>
            <div style={{ height: '300px', position: 'relative' }}>
              <Bar data={durationBarData} options={commonOptions} />
            </div>
          </div>

          {/* Line Chart */}
          <div className="card">
            <h3>🔥 Calories Burned Trend</h3>
            <p className="text-muted text-sm mb-4">
              Caloric burn trajectory across training sessions
            </p>
            <div style={{ height: '300px', position: 'relative' }}>
              <Line data={caloriesLineData} options={commonOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Pie Chart & Insights */}
        <div className="grid grid-2 mt-6">
          {/* Pie Chart */}
          <div className="card">
            <h3>🍕 Workout Categories</h3>
            <p className="text-muted text-sm mb-4">
              Distribution of workouts by exercise category
            </p>
            <div
              style={{
                height: '300px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Pie
                data={categoryPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', font: { family: 'Inter' } },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Quick Insights Card */}
          <div className="card flex-column flex-center">
            <h3>📈 Key Analytics Highlights</h3>
            <div className="profile-details-list w-100 mt-4">
              <div className="detail-item">
                <span>Total Recorded Sessions:</span>
                <strong>{workouts.length}</strong>
              </div>
              <div className="detail-item">
                <span>Avg. Duration per Session:</span>
                <strong>
                  {Math.round(
                    workouts.reduce((s, w) => s + w.duration, 0) /
                      (workouts.length || 1)
                  )}{' '}
                  mins
                </strong>
              </div>
              <div className="detail-item">
                <span>Avg. Calories per Session:</span>
                <strong>
                  {Math.round(
                    workouts.reduce((s, w) => s + w.caloriesBurned, 0) /
                      (workouts.length || 1)
                  )}{' '}
                  kcal
                </strong>
              </div>
              <div className="detail-item">
                <span>Favorite Category:</span>
                <strong className="text-primary">
                  {categoryLabels[0] || 'N/A'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Progress;
