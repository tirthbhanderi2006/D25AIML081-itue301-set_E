import React from 'react';

/**
 * Task 1: Reusable VehicleCard Component
 * Accepts props: model, type, pricePerDay, available (and optional callback/image)
 * Displays all four values.
 * Uses a clean ternary operator to swap between the "Book Now" button and "Not Available" badge.
 */
const VehicleCard = ({
  model,
  type,
  pricePerDay,
  available,
  imageUrl,
  seats,
  fuelType,
  transmission,
  onBook,
  isSelected
}) => {
  // Default fallback image if none provided
  const fallbackImage =
    type === 'SUV'
      ? 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
      : type === 'Sedan'
      ? 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={`vehicle-card ${isSelected ? 'selected-vehicle' : ''}`}>
      {/* Vehicle Media Header */}
      <div className="vehicle-image-wrapper">
        <img
          src={imageUrl || fallbackImage}
          alt={model}
          className="vehicle-image"
          loading="lazy"
        />
        <div className="vehicle-status-tag">
          <span className={`badge ${available ? 'badge-available' : 'badge-unavailable'}`}>
            {available ? '● In Fleet' : '● Booked'}
          </span>
        </div>
      </div>

      {/* Vehicle Details Body */}
      <div className="vehicle-card-body">
        {/* Type & Model (Values 1 & 2) */}
        <div className="vehicle-meta-top">
          <span className="badge-pill-type">{type}</span>
        </div>
        <h3 className="vehicle-model">{model}</h3>

        {/* Extra Specs */}
        <div className="vehicle-features">
          <span className="feature-chip">🪑 {seats || 5} Seats</span>
          <span className="feature-chip">⛽ {fuelType || 'Petrol'}</span>
          <span className="feature-chip">⚙️ {transmission || 'Automatic'}</span>
        </div>

        {/* Pricing & Booking Action Row */}
        <div className="vehicle-pricing-row">
          {/* Price per day (Value 3) */}
          <div className="price-container">
            <span className="price-label">Rental Rate</span>
            <div>
              <span className="price-value">₹{pricePerDay}</span>
              <span className="price-unit"> / day</span>
            </div>
          </div>

          {/* Value 4 & Swap logic:
              If available is false, render "Not Available" badge;
              if true, render "Book Now" button (Task 1 requirement) */}
          <div>
            {available ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onBook}
                id={`book-now-${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                Book Now
              </button>
            ) : (
              <span className="badge badge-unavailable" style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
                Not Available
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
