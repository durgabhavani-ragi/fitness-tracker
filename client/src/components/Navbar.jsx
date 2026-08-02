import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand flex-center gap-2" onClick={handleNavLinkClick}>
          <span className="brand-icon text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </span>
          FitPulse
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link
            to="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={handleNavLinkClick}
          >
            Dashboard
          </Link>
          <Link
            to="/workouts"
            className={`nav-item ${isActive('/workouts') ? 'active' : ''}`}
            onClick={handleNavLinkClick}
          >
            Workouts
          </Link>
          <Link
            to="/progress"
            className={`nav-item ${isActive('/progress') ? 'active' : ''}`}
            onClick={handleNavLinkClick}
          >
            Progress
          </Link>
          <Link
            to="/saved-goals"
            className={`nav-item ${isActive('/saved-goals') ? 'active' : ''}`}
            onClick={handleNavLinkClick}
          >
            Saved Goals
          </Link>
          <Link
            to="/goals"
            className={`nav-item ${isActive('/goals') ? 'active' : ''}`}
            onClick={handleNavLinkClick}
          >
            Goals
          </Link>

          <Link
            to="/profile"
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={handleNavLinkClick}
          >
            Profile
          </Link>

          <div className="nav-user-mobile">
            {user?.name && <span className="user-name">Hi, {user.name}</span>}
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        </div>

        <div className="nav-user nav-user-desktop">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user?.name && <span className="user-name">Hi, {user.name}</span>}
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
