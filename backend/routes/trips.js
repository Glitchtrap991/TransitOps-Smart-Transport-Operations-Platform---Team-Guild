const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
} = require('../controllers/tripController');

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.put('/:id/dispatch', dispatchTrip);
router.put('/:id/complete', completeTrip);
router.put('/:id/cancel', cancelTrip);

module.exports = router;
