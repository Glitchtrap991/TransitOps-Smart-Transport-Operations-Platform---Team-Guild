const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const {
  getLicenseAlerts,
  getROI,
  getSystemAlerts,
} = require('../controllers/analyticsController');

router.get('/license-alerts', getLicenseAlerts);
router.get('/system-alerts', getSystemAlerts);
router.get('/roi', getROI);

module.exports = router;
