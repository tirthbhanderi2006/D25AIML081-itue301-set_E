import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * MyBookingsPage Component
 * Route: /my-bookings (Protected)
 * Fetches and displays customer's own bookings with populated fields
 * and allows updating booking status.
 */
const MyBookingsPage = () => {
  const { token, customer } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchMyBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/bookings/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load your reservations (HTTP ${response.status})`);
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      setError(err.message || 'Error communicating with booking service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, [token]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setStatusMessage('');
    try {
      const response = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status');
      }

      setStatusMessage(`Booking status successfully changed to: ${newStatus}`);
      // Refresh list
      fetchMyBookings();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reserved':
        return <span className="badge badge-reserved">● Reserved</span>;
      case 'ongoing':
        return <span className="badge badge-ongoing">● Ongoing</span>;
      case 'completed':
        return <span className="badge badge-completed">● Completed</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">● Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Vehicle Bookings</h1>
          <p className="page-subtitle">
            View your active reservations, trip history, and rental status.
          </p>
        </div>
        <Link to="/fleet" className="btn btn-primary">
          + Book Another Vehicle
        </Link>
      </div>

      {statusMessage && (
        <div className="alert alert-success" role="alert">
          {statusMessage}
        </div>
      )}

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading your reservations...</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-error" role="alert">
          <div>{error}</div>
          <button onClick={fetchMyBookings} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚘</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Bookings Found</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            You haven't reserved any vehicles yet. Check out our available fleet!
          </p>
          <Link to="/fleet" className="btn btn-primary">
            Browse Fleet
          </Link>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((booking) => {
            const vehicle = booking.vehicleId || {};
            const cust = booking.customerId || {};
            const pDate = new Date(booking.pickupDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const rDate = new Date(booking.returnDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={booking._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.25rem' }}>{vehicle.model || 'Vehicle Record'}</h3>
                      <span className="badge-pill-type">{vehicle.type || 'Standard'}</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Booking ID: <code style={{ background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{booking._id}</code>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Total Cost</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb' }}>
                      ₹{booking.totalAmount || (booking.totalDays * (vehicle.pricePerDay || 0))}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      ({booking.totalDays} day{booking.totalDays > 1 ? 's' : ''})
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Customer (Populated)</span>
                    <strong>{cust.name || customer?.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{cust.email || customer?.email}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Rental Period</span>
                    <strong>{pDate}</strong> to <strong>{rDate}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Daily Rate</span>
                    <strong>₹{vehicle.pricePerDay || 0} / day</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Booking Action</span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {booking.status === 'reserved' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'ongoing')}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Mark Picked Up
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'cancelled')}
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'ongoing' && (
                        <button
                          onClick={() => handleStatusChange(booking._id, 'completed')}
                          className="btn btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Mark Returned
                        </button>
                      )}
                      {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Completed on record</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
