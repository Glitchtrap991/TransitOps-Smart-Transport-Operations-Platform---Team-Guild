const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const {
  getMaintenanceLogs,
  createLog,
  closeLog,
} = require('../controllers/maintenanceController');

router.route('/')
  .get(getMaintenanceLogs)
  .post(createLog);

router.put('/:id/close', closeLog);

module.exports = router;
