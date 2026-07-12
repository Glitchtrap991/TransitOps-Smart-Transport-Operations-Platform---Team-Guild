const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

// All routes are protected
router.route('/').get(protect, getVehicles).post(protect, createVehicle);
router.route('/:id').put(protect, updateVehicle).delete(protect, deleteVehicle);

module.exports = router;
