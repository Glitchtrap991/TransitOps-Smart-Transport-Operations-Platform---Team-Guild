const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driverController');

// All routes are public
router.route('/').get(getDrivers).post(createDriver);
router.route('/:id').put(updateDriver).delete(deleteDriver);

module.exports = router;
