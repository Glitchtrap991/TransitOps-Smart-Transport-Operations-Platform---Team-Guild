const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMaintenanceLogs,
  createLog,
  closeLog,
} = require('../controllers/maintenanceController');

router.route('/')
  .get(protect, getMaintenanceLogs)
  .post(protect, createLog);

router.put('/:id/close', protect, closeLog);

module.exports = router;
