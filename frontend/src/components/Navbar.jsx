import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navigation component containing React Router links to all routes.
 * Displays current RBAC role badge and handles client-side routing.
 */
const Navbar = () => {
  const { customer, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadgeStyle = (userRole) => {
    switch (userRole) {
      case 'Admin':
        return { background: '#fdf2f8', color: '#9d174d', border: '1px solid #fbcfe8' };
      case 'Fleet Manager':
        return { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
      default:
        return { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' };
    }
  };

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/fleet" className="brand-logo">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
              <circle cx="7" cy="15" r="2" />
              <circle cx="17" cy="15" r="2" />
            </svg>
          </div>
          <span>DriveEasy</span>
        </Link>

        {/* Navigation Links to ALL Routes */}
        <ul className="nav-links">
          {!isAuthenticated && (
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
              >
                Login / Register
              </NavLink>
            </li>
          )}

          <li>
            <NavLink
              to="/fleet"
              className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
            >
              Fleet Catalog
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/my-bookings"
              className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
            >
              My Bookings
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
            >
              Admin Panel
              {role === 'Customer' && (
                <span style={{ fontSize: '0.65rem', marginLeft: '0.35rem', color: '#ef4444' }}>[🔒 RBAC]</span>
              )}
            </NavLink>
          </li>
        </ul>

        {/* User Info / Role Badge / Logout Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated && customer ? (
            <>
              <div className="nav-user-badge">
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    ...getRoleBadgeStyle(role)
                  }}
                >
                  {role}
                </span>
                <span>{customer.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                title="Log out"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
