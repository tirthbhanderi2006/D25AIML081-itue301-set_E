import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage: Customer & Staff Authentication with RBAC Role Selection
 * Roles supported: Customer, Fleet Manager, Admin (as required by PDF)
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Customer');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/fleet';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/fleet', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, licenseNumber, role, name);
    setIsSubmitting(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMessage(result.message || 'Login failed. Please check credentials.');
    }
  };

  // Quick 1-Click Login for each RBAC Role
  const loginAsRole = async (targetRole) => {
    let emailToUse = '';
    let licenseToUse = '';
    let nameToUse = '';

    if (targetRole === 'Customer') {
      emailToUse = 'tirth@example.com';
      licenseToUse = 'GJ01-2023-0098765';
      nameToUse = 'Tirth Patel';
    } else if (targetRole === 'Fleet Manager') {
      emailToUse = 'manager@driveeasy.com';
      licenseToUse = 'GJ01-2021-MGR001';
      nameToUse = 'Vikram Mehta';
    } else if (targetRole === 'Admin') {
      emailToUse = 'admin@driveeasy.com';
      licenseToUse = 'GJ01-2020-ADM999';
      nameToUse = 'Devraj Joshi';
    }

    setEmail(emailToUse);
    setLicenseNumber(licenseToUse);
    setName(nameToUse);
    setRole(targetRole);

    setIsSubmitting(true);
    const result = await login(emailToUse, licenseToUse, targetRole, nameToUse);
    setIsSubmitting(false);

    if (result.success) {
      if (targetRole === 'Admin' || targetRole === 'Fleet Manager') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/fleet', { replace: true });
      }
    } else {
      setErrorMessage(result.message || 'Login failed.');
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto 0 auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '0.75rem',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>DriveEasy Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Multi-Role Authentication (Customer · Fleet Manager · Admin)
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <div>{errorMessage}</div>
          </div>
        )}

        {/* 1-Click Role Switcher Buttons for Exam Demo */}
        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            ⚡ 1-Click Role Logins (Pre-Seeded)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', textAlign: 'center', borderColor: '#bfdbfe' }}
              onClick={() => loginAsRole('Customer')}
              id="login-role-customer"
            >
              👤 Customer
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', textAlign: 'center', borderColor: '#bbf7d0' }}
              onClick={() => loginAsRole('Fleet Manager')}
              id="login-role-manager"
            >
              📋 Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', textAlign: 'center', borderColor: '#fbcfe8' }}
              onClick={() => loginAsRole('Admin')}
              id="login-role-admin"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="role-select">
              Select User Role (RBAC) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="role-select"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Customer">Customer (Rental Bookings)</option>
              <option value="Fleet Manager">Fleet Manager (Fleet & Booking Audits)</option>
              <option value="Admin">Admin (Full System Control)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. tirth@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="e.g. Tirth Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="licenseNumber">
              Driving License Number
            </label>
            <input
              id="licenseNumber"
              type="text"
              className="form-input"
              placeholder="e.g. GJ01-2023-0098765"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? 'Authenticating...' : `Sign In as ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
