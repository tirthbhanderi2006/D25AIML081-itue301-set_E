const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

// All booking routes require authentication token
router.use(authGuard);

// POST /api/v1/bookings - Create new booking (protected, all authenticated roles)
router.post('/', createBooking);

// GET /api/v1/bookings/my - Return customer's own bookings (protected)
router.get('/my', getMyBookings);

// GET /api/v1/bookings - Return all system bookings (protected, RBAC: Admin & Fleet Manager only)
router.get('/', roleGuard(['Admin', 'Fleet Manager']), getAllBookings);

// PATCH /api/v1/bookings/:id/status - Update booking status (protected)
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
