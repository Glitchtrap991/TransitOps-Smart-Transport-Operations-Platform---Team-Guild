const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addDocument,
} = require('../controllers/vehicleController');

// All routes are public
router.route('/').get(getVehicles).post(createVehicle);
router.route('/:id').put(updateVehicle).delete(deleteVehicle);
router.post('/:id/documents', addDocument);

module.exports = router;
