import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Standard Pages
import LoginPage from './pages/LoginPage';
import FleetPage from './pages/FleetPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Task 2: Lazy-loaded route for Admin Panel using React.lazy + Suspense
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Fallback loader for Suspense
const SuspenseLoader = () => (
  <div className="spinner-container" style={{ padding: '6rem 1rem' }}>
    <div className="spinner"></div>
    <p style={{ fontWeight: 600 }}>Loading Admin Panel (Lazy Chunk)...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          {/* Navigation with links to all routes */}
          <Navbar />

          {/* Main content route views */}
          <main className="main-content">
            <Routes>
              {/* Route 1: / -> LoginPage */}
              <Route path="/" element={<LoginPage />} />

              {/* Route 2: /fleet -> FleetPage (protected) */}
              <Route
                path="/fleet"
                element={
                  <ProtectedRoute>
                    <FleetPage />
                  </ProtectedRoute>
                }
              />

              {/* Route 3: /my-bookings -> MyBookingsPage (protected) */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Route 4: /admin -> AdminPanel (lazy-loaded with React.lazy + Suspense, RBAC restricted to Fleet Manager & Admin) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager']}>
                    <Suspense fallback={<SuspenseLoader />}>
                      <AdminPanel />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="footer">
            <p>
              <strong>DriveEasy Car Rental System</strong> · ITUE301 Advanced Web Development Frameworks Practical Exam
            </p>
            <p style={{ marginTop: '0.25rem', color: '#94a3b8' }}>
              Student: D25AIML081 · Batch D · CHARUSAT CSPIT · RBAC Enabled (Customer, Fleet Manager, Admin)
            </p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
