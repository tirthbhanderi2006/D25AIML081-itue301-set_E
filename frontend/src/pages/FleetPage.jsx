import React, { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';

/**
 * FleetPage Component
 * Fulfills Task 2 (State & Booking Form) and Task 4 (API Consumption & Client-Side Filtering)
 */
const FleetPage = () => {
  const { token, customer } = useAuth();

  // Task 4: Three required states for API fetching
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task 4: Client-side filter state (All | Hatchback | Sedan | SUV)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // Task 2: Meaningful useState hooks for booking form
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Booking action feedback states
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Default dates: tomorrow and 3 days later
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 4);

    setPickupDate(tomorrow.toISOString().split('T')[0]);
    setReturnDate(threeDays.toISOString().split('T')[0]);
  }, []);

  // Task 4: Fetch vehicle data using useEffect on component mount
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/vehicles');
      if (!response.ok) {
        throw new Error(`Failed to load fleet catalog (HTTP ${response.status})`);
      }
      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the fleet API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Task 4 Hint: Keep full array in state; derive filtered list with .filter()
  // Client-side filtering without triggering new API request!
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (selectedTypeFilter === 'All') return true;
    return vehicle.type.toLowerCase() === selectedTypeFilter.toLowerCase();
  });

  // Calculate estimated cost live
  const calculateEstimatedTotal = () => {
    if (!selectedVehicle || !pickupDate || !returnDate) return 0;
    const pDate = new Date(pickupDate);
    const rDate = new Date(returnDate);
    const diffTime = rDate.getTime() - pDate.getTime();
    if (diffTime < 0) return 0;
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return days * selectedVehicle.pricePerDay;
  };

  // Handle form submission to POST /api/v1/bookings
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingSuccess('');
    setBookingError('');

    if (!selectedVehicle) {
      setBookingError('Please choose a vehicle from the fleet to book.');
      return;
    }

    if (!pickupDate || !returnDate) {
      setBookingError('Please specify valid pickup and return dates.');
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle._id,
          pickupDate,
          returnDate
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Booking reservation failed');
      }

      setBookingSuccess(
        `Reservation Confirmed! Booking ID: ${result.data._id} for ${selectedVehicle.model}. Total: ₹${result.data.totalAmount}`
      );

      // Optimistically update vehicle status to false in local state
      setVehicles((prev) =>
        prev.map((v) => (v._id === selectedVehicle._id ? { ...v, available: false } : v))
      );

      // Clear selected vehicle
      setSelectedVehicle(null);
    } catch (err) {
      setBookingError(err.message || 'Error occurred while booking the vehicle.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div>
      {/* Header section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">DriveEasy Vehicle Fleet</h1>
        <p className="page-subtitle">
          Browse our verified self-drive vehicles, check real-time availability, and reserve instantly.
        </p>
      </div>

      {/* Task 2: Live Booking Form Section */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Quick Reservation Form</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Select a vehicle below or choose from the dropdown, specify dates, and book.
            </p>
          </div>
          {/* Task 2 Requirement: Display selected vehicle on page as state changes */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Active Selection
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: selectedVehicle ? '#2563eb' : '#94a3b8' }}>
              {selectedVehicle ? `🚗 ${selectedVehicle.model} (₹${selectedVehicle.pricePerDay}/day)` : 'None Selected'}
            </div>
          </div>
        </div>

        {bookingSuccess && (
          <div className="alert alert-success" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div>{bookingSuccess}</div>
          </div>
        )}

        {bookingError && (
          <div className="alert alert-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <div>{bookingError}</div>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          {/* Field 1: Selected Vehicle */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="vehicle-select">
              Selected Vehicle <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="vehicle-select"
              className="form-select"
              value={selectedVehicle ? selectedVehicle._id : ''}
              onChange={(e) => {
                const found = vehicles.find((v) => v._id === e.target.value);
                setSelectedVehicle(found || null);
              }}
            >
              <option value="">-- Choose a Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id} disabled={!v.available}>
                  {v.model} ({v.type}) - ₹{v.pricePerDay}/day {!v.available ? '[UNAVAILABLE]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Field 2: Pickup Date (State value 2) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="pickupDate">
              Pickup Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="pickupDate"
              type="date"
              className="form-input"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
            />
          </div>

          {/* Field 3: Return Date (State value 3) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="returnDate">
              Return Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="returnDate"
              type="date"
              className="form-input"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>

          {/* Booking Submit Button */}
          <div>
            <button
              type="submit"
              className={`btn btn-primary ${!selectedVehicle ? 'btn-disabled' : ''}`}
              style={{ width: '100%', height: '44px' }}
              disabled={!selectedVehicle || bookingLoading}
              id="confirm-booking-btn"
            >
              {bookingLoading ? 'Reserving...' : `Confirm Booking ${calculateEstimatedTotal() > 0 ? `(₹${calculateEstimatedTotal()})` : ''}`}
            </button>
          </div>
        </form>
      </div>

      {/* Task 4: Client-side Filter Bar (All | Hatchback | Sedan | SUV) */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>Filter by Type:</span>
          <div className="filter-pills">
            {['All', 'Hatchback', 'Sedan', 'SUV'].map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-btn ${selectedTypeFilter.toLowerCase() === type.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedTypeFilter(type)}
                id={`filter-${type.toLowerCase()}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing <strong>{filteredVehicles.length}</strong> of <strong>{vehicles.length}</strong> vehicles
        </div>
      </div>

      {/* Task 4: 1) Loading Indicator */}
      {loading && (
        <div className="spinner-container" role="status">
          <div className="spinner"></div>
          <p>Retrieving fleet catalog from Express server...</p>
        </div>
      )}

      {/* Task 4: 2) Friendly Error Message */}
      {error && !loading && (
        <div className="alert alert-error" role="alert">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div>
            <strong>Unable to load vehicles:</strong> {error}
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={fetchVehicles} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}>
                Retry Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task 4: 3) Render Grid of VehicleCard Components */}
      {!loading && !error && (
        <>
          {filteredVehicles.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No vehicles found matching category: "{selectedTypeFilter}"</p>
              <button onClick={() => setSelectedTypeFilter('All')} className="btn btn-secondary">
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="vehicles-grid">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  model={vehicle.model}
                  type={vehicle.type}
                  pricePerDay={vehicle.pricePerDay}
                  available={vehicle.available}
                  imageUrl={vehicle.imageUrl}
                  seats={vehicle.seats}
                  fuelType={vehicle.fuelType}
                  transmission={vehicle.transmission}
                  isSelected={selectedVehicle?._id === vehicle._id}
                  onBook={() => {
                    setSelectedVehicle(vehicle);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FleetPage;
