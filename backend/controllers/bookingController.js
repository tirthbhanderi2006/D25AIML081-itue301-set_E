const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

/**
 * Helper function for booking creation logic
 * Separated for easy viva explanation.
 * Validates vehicle availability, calculates duration/amount, creates booking record,
 * and sets vehicle availability to false.
 */
const createBookingLogic = async ({ customerId, vehicleId, pickupDate, returnDate }) => {
  // 1. Validate required fields
  if (!vehicleId || !pickupDate || !returnDate) {
    const error = new Error('Vehicle, pickup date, and return date are all required');
    error.status = 400;
    throw error;
  }

  const pDate = new Date(pickupDate);
  const rDate = new Date(returnDate);

  if (isNaN(pDate.getTime()) || isNaN(rDate.getTime())) {
    const error = new Error('Invalid pickup or return date format');
    error.status = 400;
    throw error;
  }

  if (rDate < pDate) {
    const error = new Error('Return date cannot be earlier than pickup date');
    error.status = 400;
    throw error;
  }

  // 2. Fetch vehicle and verify availability
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    const error = new Error('Selected vehicle does not exist');
    error.status = 404;
    throw error;
  }

  // Task 5 validation requirement: Return 400 if vehicle is not available
  if (vehicle.available !== true) {
    const error = new Error(`Vehicle "${vehicle.model}" is currently unavailable for booking.`);
    error.status = 400;
    throw error;
  }

  // 3. Calculate total rental days and estimated amount
  const diffTime = Math.abs(rDate.getTime() - pDate.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = diffDays * vehicle.pricePerDay;

  // 4. Create the booking record
  const booking = await Booking.create({
    customerId,
    vehicleId,
    pickupDate: pDate,
    returnDate: rDate,
    status: 'reserved',
    totalDays: diffDays,
    totalAmount
  });

  // 5. Update vehicle availability to false
  await Vehicle.findByIdAndUpdate(vehicleId, { available: false });

  // Populate references for the response
  const populatedBooking = await Booking.findById(booking._id)
    .populate('customerId', 'name email')
    .populate('vehicleId', 'model type pricePerDay');

  return populatedBooking;
};

/**
 * Controller to create a new booking
 * POST /api/v1/bookings (Protected)
 */
const createBooking = async (req, res, next) => {
  try {
    const customerId = req.customer.customerId;
    const { vehicleId, pickupDate, returnDate } = req.body;

    const newBooking = await createBookingLogic({
      customerId,
      vehicleId,
      pickupDate,
      returnDate
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get customer's own bookings
 * GET /api/v1/bookings/my (Protected)
 * Must use .populate('customerId', 'name email') and .populate('vehicleId', 'model type')
 */
const getMyBookings = async (req, res, next) => {
  try {
    const customerId = req.customer.customerId;

    const bookings = await Booking.find({ customerId })
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type pricePerDay available')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get all bookings (For Admin / Fleet Manager)
 * GET /api/v1/bookings (Protected, RBAC)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email phone licenseNumber role')
      .populate('vehicleId', 'model type pricePerDay available')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update booking status
 * PATCH /api/v1/bookings/:id/status (Protected)
 * Customer can update their own booking; Admin and Fleet Manager can update any booking.
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.customer.role || 'Customer';
    const userId = req.customer.customerId;

    const allowedStatuses = ['reserved', 'ongoing', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // RBAC check: Customer cannot modify someone else's booking
    if (userRole === 'Customer' && booking.customerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify bookings belonging to other customers.'
      });
    }

    booking.status = status;
    await booking.save();

    // If booking is completed or cancelled, release vehicle back to available
    if (status === 'completed' || status === 'cancelled') {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });
    } else if (status === 'reserved' || status === 'ongoing') {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: false });
    }

    const updatedBooking = await Booking.findById(id)
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type pricePerDay available');

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  createBookingLogic
};
