const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driverController');

// All routes are protected
router.route('/').get(protect, getDrivers).post(protect, createDriver);
router.route('/:id').put(protect, updateDriver).delete(protect, deleteDriver);

module.exports = router;
