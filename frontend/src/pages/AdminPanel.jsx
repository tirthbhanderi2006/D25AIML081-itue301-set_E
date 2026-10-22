import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * AdminPanel Component (Lazy-Loaded Route via React.lazy + Suspense)
 * Protected by RBAC for: Fleet Manager & Admin
 * Features:
 * - Fleet Inventory Metrics
 * - Toggle Vehicle Availability (Manager & Admin)
 * - Add New Vehicle (Admin)
 * - Remove / Delete Vehicle from Fleet (Admin)
 * - Full System Bookings Audit & Status Management (Manager & Admin)
 */
const AdminPanel = () => {
  const { token, role, customer } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'bookings' | 'add-vehicle'
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Vehicle form state (for Admin)
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState('Hatchback');
  const [newPrice, setNewPrice] = useState(2000);
  const [newSeats, setNewSeats] = useState(5);
  const [newFuel, setNewFuel] = useState('Petrol');
  const [isAdding, setIsAdding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch all vehicles (public)
      const resVehicles = await fetch('/api/v1/vehicles');
      const dataVehicles = await resVehicles.json();
      setVehicles(dataVehicles.data || []);

      // 2. Fetch all system bookings (protected, RBAC: Admin & Fleet Manager)
      if (token) {
        const resBookings = await fetch('/api/v1/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resBookings.ok) {
          const dataBookings = await resBookings.json();
          setBookings(dataBookings.data || []);
        } else {
          const err = await resBookings.json();
          setErrorMsg(err.message || 'Failed to load system bookings.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Toggle vehicle availability via PATCH /api/v1/vehicles/:id/availability
  const toggleVehicleAvailability = async (vehicle) => {
    setNotification('');
    setErrorMsg('');
    try {
      const response = await fetch(`/api/v1/vehicles/${vehicle._id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ available: !vehicle.available })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update vehicle availability');
      }

      setNotification(`Vehicle "${vehicle.model}" availability toggled to: ${!vehicle.available ? 'AVAILABLE' : 'UNAVAILABLE'}`);
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicle._id ? { ...v, available: !vehicle.available } : v))
      );
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Delete/Remove vehicle from fleet (Admin only)
  const handleDeleteVehicle = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${vehicle.model}" from the fleet?`)) {
      return;
    }

    setNotification('');
    setErrorMsg('');
    try {
      const response = await fetch(`/api/v1/vehicles/${vehicle._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete vehicle');
      }

      setNotification(`Vehicle "${vehicle.model}" has been permanently removed from the fleet.`);
      // Remove from local list
      setVehicles((prev) => prev.filter((v) => v._id !== vehicle._id));
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Add new vehicle via POST /api/v1/vehicles (Admin only)
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setNotification('');
    setErrorMsg('');

    try {
      const response = await fetch('/api/v1/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          model: newModel,
          type: newType,
          pricePerDay: Number(newPrice),
          seats: Number(newSeats),
          fuelType: newFuel,
          available: true
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add vehicle');
      }

      setNotification(`New vehicle "${newModel}" added successfully to fleet!`);
      setNewModel('');
      setActiveTab('vehicles');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Update booking status via PATCH /api/v1/bookings/:id/status
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status');
      }

      setNotification(`Booking ${bookingId.slice(-6)} updated to status: ${status}`);
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-reserved" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
            ⚡ LAZY-LOADED ADMIN ROUTE (React.lazy + Suspense)
          </span>
          <span className="badge badge-ongoing" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
            🛡️ RBAC: {role}
          </span>
        </div>
        <h1 className="page-title">DriveEasy Fleet Command & Audit</h1>
        <p className="page-subtitle">
          Logged in as <strong>{customer?.name}</strong>. Manage vehicle inventory, remove units, toggle availability, and audit bookings.
        </p>
      </div>

      {notification && (
        <div className="alert alert-success" role="alert">
          {notification}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error" role="alert">
          {errorMsg}
        </div>
      )}

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Fleet Units</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{vehicles.length}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Available for Rent</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {vehicles.filter((v) => v.available).length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Currently Booked</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {vehicles.filter((v) => !v.available).length}
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total System Bookings</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.25rem' }}>
            {bookings.length}
          </div>
        </div>
      </div>

      {/* Tab controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`btn ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'}`}
          id="tab-vehicles"
        >
          Fleet Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          id="tab-bookings"
        >
          All System Bookings ({bookings.length})
        </button>
        {role === 'Admin' && (
          <button
            onClick={() => setActiveTab('add-vehicle')}
            className={`btn ${activeTab === 'add-vehicle' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-add-vehicle"
          >
            + Add New Vehicle
          </button>
        )}
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      )}

      {/* Tab 1: Vehicles Management Table */}
      {!loading && activeTab === 'vehicles' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Model</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Daily Rate</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions (Toggle Availability & Delete)</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{v.model}</td>
                  <td style={{ padding: '1rem' }}><span className="badge-pill-type">{v.type}</span></td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>₹{v.pricePerDay}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${v.available ? 'badge-available' : 'badge-unavailable'}`}>
                      {v.available ? '● Available' : '● Unavailable'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleVehicleAvailability(v)}
                        className={`btn ${v.available ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                        id={`toggle-${v._id}`}
                      >
                        {v.available ? 'Set Unavailable' : 'Set Available'}
                      </button>

                      {role === 'Admin' && (
                        <button
                          onClick={() => handleDeleteVehicle(v)}
                          className="btn btn-danger"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                          title="Delete vehicle permanently"
                          id={`delete-${v._id}`}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: System Bookings Audit Table */}
      {!loading && activeTab === 'bookings' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          {bookings.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
              No bookings registered in the system yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Booking ID</th>
                  <th style={{ padding: '1rem' }}>Customer</th>
                  <th style={{ padding: '1rem' }}>Vehicle</th>
                  <th style={{ padding: '1rem' }}>Dates</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Manager Controls</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{b._id}</td>
                    <td style={{ padding: '1rem' }}>
                      <strong>{b.customerId?.name || 'Customer'}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.customerId?.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <strong>{b.vehicleId?.model || 'Vehicle'}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.vehicleId?.type}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                      {new Date(b.pickupDate).toLocaleDateString()} &rarr; {new Date(b.returnDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#2563eb' }}>₹{b.totalAmount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${b.status}`}>● {b.status}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                        value={b.status}
                        onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                      >
                        <option value="reserved">reserved</option>
                        <option value="ongoing">ongoing</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Add Vehicle (Admin Only) */}
      {!loading && activeTab === 'add-vehicle' && role === 'Admin' && (
        <div className="card" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Add New Fleet Vehicle</h3>
          <form onSubmit={handleAddVehicle}>
            <div className="form-group">
              <label className="form-label">Model Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tata Nexon EV"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Daily Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Seats</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  className="form-input"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Electric / Petrol"
                  value={newFuel}
                  onChange={(e) => setNewFuel(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isAdding} style={{ width: '100%', marginTop: '0.5rem' }}>
              {isAdding ? 'Adding Vehicle...' : 'Add Vehicle to Fleet'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
