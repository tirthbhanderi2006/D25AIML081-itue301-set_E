import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const storedCustomer = localStorage.getItem('driveeasy_customer');
      return storedCustomer ? JSON.parse(storedCustomer) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('driveeasy_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Sync token & customer changes with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('driveeasy_token', token);
    } else {
      localStorage.removeItem('driveeasy_token');
    }
  }, [token]);

  useEffect(() => {
    if (customer) {
      localStorage.setItem('driveeasy_customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('driveeasy_customer');
    }
  }, [customer]);

  const login = async (email, licenseNumber, role = 'Customer', name = '') => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, licenseNumber, role, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      setToken(data.token);
      setCustomer(data.customer);
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    localStorage.removeItem('driveeasy_token');
    localStorage.removeItem('driveeasy_customer');
  };

  const value = {
    customer,
    role: customer?.role || 'Customer',
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
