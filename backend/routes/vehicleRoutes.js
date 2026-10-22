const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  toggleVehicleAvailability,
  deleteVehicle
} = require('../controllers/vehicleController');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

// Public route: Return all vehicles (Task 3 requirement)
router.get('/', getAllVehicles);

// Public route: Get single vehicle
router.get('/:id', getVehicleById);

// Admin-only route: Create new vehicle
router.post('/', authGuard, roleGuard(['Admin']), createVehicle);

// Fleet Manager & Admin route: Toggle availability
router.patch('/:id/availability', authGuard, roleGuard(['Admin', 'Fleet Manager']), toggleVehicleAvailability);

// Admin-only route: Permanently remove/delete vehicle from fleet
router.delete('/:id', authGuard, roleGuard(['Admin']), deleteVehicle);

module.exports = router;
