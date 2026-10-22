const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

/**
 * Controller to get all vehicles
 * GET /api/v1/vehicles (Public)
 */
const getAllVehicles = async (req, res, next) => {
  try {
    const { type, available } = req.query;
    const filter = {};

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (available !== undefined) {
      filter.available = available === 'true';
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get single vehicle by ID
 * GET /api/v1/vehicles/:id
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to create a new vehicle (Admin only)
 * POST /api/v1/vehicles
 */
const createVehicle = async (req, res, next) => {
  try {
    const { model, type, pricePerDay, available, seats, fuelType, transmission, imageUrl } = req.body;
    const vehicle = await Vehicle.create({
      model,
      type,
      pricePerDay,
      available: available !== undefined ? available : true,
      seats: seats || 5,
      fuelType: fuelType || 'Petrol',
      transmission: transmission || 'Automatic',
      imageUrl: imageUrl || ''
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully in fleet',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to toggle vehicle availability (Admin & Fleet Manager only)
 * PATCH /api/v1/vehicles/:id/availability
 */
const toggleVehicleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const newStatus = req.body.available !== undefined ? req.body.available : !vehicle.available;
    vehicle.available = newStatus;
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: `Vehicle "${vehicle.model}" availability set to: ${vehicle.available}`,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete/remove a vehicle from fleet (Admin only)
 * DELETE /api/v1/vehicles/:id
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Clean up related bookings
    await Booking.deleteMany({ vehicleId: id });
    // Remove vehicle from collection
    await Vehicle.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Vehicle "${vehicle.model}" has been permanently removed from the fleet.`,
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  toggleVehicleAvailability,
  deleteVehicle
};
