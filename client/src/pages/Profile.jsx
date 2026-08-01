import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bmiInfo, setBmiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, bmiRes] = await Promise.all([
        API.get('/auth/profile'),
        API.get('/auth/bmi').catch(() => null), // Ignore if height/weight not set
      ]);

      const userProfile = profileRes.data;
      setProfile(userProfile);
      if (bmiRes?.data) {
        setBmiInfo(bmiRes.data);
      }

      setFormData({
        name: userProfile.name || '',
        age: userProfile.age || '',
        gender: userProfile.gender || 'Male',
        height: userProfile.height || '',
        weight: userProfile.weight || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile.');
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
        name: formData.name,
        gender: formData.gender,
      };

      if (formData.age) payload.age = Number(formData.age);
      if (formData.height) payload.height = Number(formData.height);
      if (formData.weight) payload.weight = Number(formData.weight);

      const response = await API.put('/auth/profile', payload);
      setSuccess('Profile updated successfully!');

      if (response.data?.user) {
        updateUser(response.data.user);
      }

      fetchProfileData();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
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
          <h1>User Profile</h1>
          <p className="subtitle">View and update your personal health details</p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loader-container">
            <div className="spinner-large"></div>
            <p>Loading profile details...</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {/* Edit Profile Card */}
            <div className="card">
              <h2>Edit Profile Information</h2>
              <form onSubmit={handleSubmit} className="auth-form mt-4">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="input-disabled"
                  />
                  <small className="text-muted">Email cannot be changed.</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height">Height (cm)</label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight">Weight (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block mt-4"
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner"></span> : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* BMI & Stats Summary Card */}
            <div className="card-stack flex-column gap-4">
              <div className="card">
                <h3>BMI Analysis</h3>
                {bmiInfo ? (
                  <div className="bmi-box mt-3 text-center">
                    <div className="bmi-value-large">{bmiInfo.bmi}</div>
                    <div className="bmi-category badge badge-primary mt-2">
                      {bmiInfo.category}
                    </div>
                    <p className="text-muted mt-3 text-sm">
                      Height: {bmiInfo.height} cm | Weight: {bmiInfo.weight} kg
                    </p>
                  </div>
                ) : (
                  <div className="empty-state text-center p-4">
                    <p>Provide height and weight to view your BMI score.</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h3>Account Summary</h3>
                <div className="profile-details-list mt-3">
                  <div className="detail-item">
                    <span>Member Name:</span>
                    <strong>{profile?.name}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Email:</span>
                    <strong>{profile?.email}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Age:</span>
                    <strong>{profile?.age || 'Not specified'}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Gender:</span>
                    <strong>{profile?.gender || 'Not specified'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
