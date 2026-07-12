const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true, trim: true },
  model: { type: String, required: true },
  type: { type: String, required: true },
  maxLoadCapacity: { type: Number, required: true }, // kg
  odometer: { type: Number, default: 0 },
  acquisitionCost: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available',
  },
  documents: [{
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  }],
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
