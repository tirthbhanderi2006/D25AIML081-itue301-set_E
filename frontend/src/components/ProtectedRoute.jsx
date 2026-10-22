import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Wrapper with RBAC Support
 * 1. Redirects unauthenticated users to '/' using <Navigate to="/" />
 * 2. If allowedRoles is specified, checks if the user's role has permission.
 *    If not, displays a clean 403 Access Denied screen.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, customer } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // RBAC Permission Check
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto 0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#fee2e2',
              color: '#ef4444',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              marginBottom: '1.25rem'
            }}
          >
            🚫
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: '#991b1b' }}>
            403 - Access Denied (RBAC Protected)
          </h2>
          <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            The current route is restricted to <strong>[{allowedRoles.join(', ')}]</strong>.
            <br />
            You are logged in as <strong>{customer?.name}</strong> with role:
            <span className="badge badge-unavailable" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
              {role}
            </span>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/fleet" className="btn btn-primary">
              Return to Fleet Catalog
            </Link>
            <Link to="/" className="btn btn-secondary">
              Switch Account / Role
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
