import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    workoutName: '',
    category: 'Cardio',
    duration: '',
    caloriesBurned: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/workouts');
      setWorkouts(response.data.workouts || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workouts.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (workout = null) => {
    if (workout) {
      setEditId(workout._id);
      setFormData({
        workoutName: workout.workoutName,
        category: workout.category,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        date: workout.date
          ? new Date(workout.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setEditId(null);
      setFormData({
        workoutName: '',
        category: 'Cardio',
        duration: '',
        caloriesBurned: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        workoutName: formData.workoutName,
        category: formData.category,
        duration: Number(formData.duration),
        caloriesBurned: Number(formData.caloriesBurned),
        date: formData.date,
      };

      if (editId) {
        await API.put(`/workouts/${editId}`, payload);
        setSuccess('Workout updated successfully!');
      } else {
        await API.post('/workouts', payload);
        setSuccess('Workout added successfully!');
      }

      handleCloseModal();
      fetchWorkouts();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save workout. Check fields.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;

    try {
      await API.delete(`/workouts/${id}`);
      setSuccess('Workout deleted successfully!');
      setWorkouts(workouts.filter((w) => w._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header flex-between">
          <div>
            <h1>Workout Tracker</h1>
            <p className="subtitle">Log, update, and manage your exercises</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary"
          >
            + Add Workout
          </button>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Workouts List */}
        {loading ? (
          <div className="loader-container">
            <div className="spinner-large"></div>
            <p>Loading workouts...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="card empty-state-card text-center p-8">
            <div className="empty-icon">🏃‍♂️</div>
            <h3>No Workouts Logged Yet</h3>
            <p>Click below to log your first exercise session.</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary mt-4"
            >
              Log Workout Now
            </button>
          </div>
        ) : (
          <div className="grid grid-3 mt-4">
            {workouts.map((workout) => (
              <div key={workout._id} className="card workout-card">
                <div className="workout-header flex-between">
                  <span className="workout-category badge badge-info">
                    {workout.category}
                  </span>
                  <span className="workout-date">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="workout-title mt-2">{workout.workoutName}</h3>

                <div className="workout-metrics flex-around mt-4">
                  <div className="metric">
                    <span className="metric-label">Duration</span>
                    <strong className="metric-value">{workout.duration} mins</strong>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Calories</span>
                    <strong className="metric-value text-pink">
                      {workout.caloriesBurned} kcal
                    </strong>
                  </div>
                </div>

                <div className="workout-actions flex-end gap-2 mt-4 pt-3 border-top">
                  <button
                    onClick={() => handleOpenModal(workout)}
                    className="btn btn-sm btn-outline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workout._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-content card">
              <div className="modal-header flex-between">
                <h2>{editId ? 'Edit Workout' : 'Log New Workout'}</h2>
                <button
                  onClick={handleCloseModal}
                  className="btn-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body mt-4">
                <div className="form-group">
                  <label htmlFor="workoutName">Workout Name *</label>
                  <input
                    type="text"
                    id="workoutName"
                    name="workoutName"
                    placeholder="e.g. Running, Bench Press, HIIT"
                    value={formData.workoutName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Crossfit">Crossfit</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="duration">Duration (mins) *</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      placeholder="45"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="caloriesBurned">Calories Burned *</label>
                    <input
                      type="number"
                      id="caloriesBurned"
                      name="caloriesBurned"
                      placeholder="350"
                      value={formData.caloriesBurned}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-footer flex-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="spinner"></span>
                    ) : editId ? (
                      'Save Changes'
                    ) : (
                      'Log Workout'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Workouts;
