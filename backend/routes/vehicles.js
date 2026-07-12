const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addDocument,
} = require('../controllers/vehicleController');

// All routes are protected
router.route('/').get(protect, getVehicles).post(protect, createVehicle);
router.route('/:id').put(protect, updateVehicle).delete(protect, deleteVehicle);
router.post('/:id/documents', protect, addDocument);

module.exports = router;
