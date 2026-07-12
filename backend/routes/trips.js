const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
} = require('../controllers/tripController');

router.route('/')
  .get(protect, getTrips)
  .post(protect, createTrip);

router.put('/:id/dispatch', protect, dispatchTrip);
router.put('/:id/complete', protect, completeTrip);
router.put('/:id/cancel', protect, cancelTrip);

module.exports = router;
