const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  liters: {
    type: Number,
    required: [true, 'Liters of fuel is required']
  },
  cost: {
    type: Number,
    required: [true, 'Fuel cost is required']
  },
  date: {
    type: Date,
    required: [true, 'Date of fueling is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('FuelLog', fuelLogSchema);
