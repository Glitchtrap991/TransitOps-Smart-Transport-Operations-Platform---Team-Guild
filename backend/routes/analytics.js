const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLicenseAlerts,
  getROI,
} = require('../controllers/analyticsController');

router.get('/license-alerts', protect, getLicenseAlerts);
router.get('/roi', protect, getROI);

module.exports = router;
