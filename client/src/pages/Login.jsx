import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', formData);
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid credentials or server error.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-landing-page animate-fade-in">
      {/* Abstract Ambient Blurred Circles */}
      <div className="ambient-bg-glow glow-1"></div>
      <div className="ambient-bg-glow glow-2"></div>
      <div className="ambient-bg-glow glow-3"></div>

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-toggle-btn login-theme-toggle"
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>


      <div className="login-landing-container">
        {/* Top Center Hero Landing Section */}
        <div className="landing-hero-section animate-slide-down">
          <div className="hero-brand-badge">
            <span className="hero-badge-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5h11M6.5 17.5h11M2 12h20M4 9v6M20 9v6M8 6.5v11M16 6.5v11"/>
              </svg>
            </span>
            <span className="hero-badge-text">FitPulse</span>
          </div>

          <h1 className="landing-title">FitPulse</h1>

          <p className="landing-tagline">
            "Transform your fitness journey. Track workouts, monitor progress, and achieve your goals—all in one place."
          </p>

          <p className="landing-description">
            Stay motivated every day with personalized workout tracking, goal management, BMI insights, and progress analytics.
          </p>
        </div>

        {/* Login Card */}
        <div className="login-landing-card animate-slide-up">
          <div className="card-header-text">
            <h2>Sign In</h2>
            <p>Welcome back! Enter your details below.</p>
          </div>

          {error && <div className="alert alert-error animate-fade-in">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <div className="input-field-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-control"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="input-field-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="input-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-gradient-lg animate-hover-btn mt-4"
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Sign In'}
            </button>
          </form>

          <div className="login-footer mt-6">
            <p>
              New to FitPulse?{' '}
              <Link to="/register" className="auth-link font-semibold">
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
