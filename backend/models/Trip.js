const mongoose = require('mongoose');
const { Schema } = mongoose;

const tripSchema = new Schema({
  source: { type: String, required: true },
  destination: { type: String, required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  cargoWeight: { type: Number, required: true },
  plannedDistance: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
});

module.exports = mongoose.model('Trip', tripSchema);
