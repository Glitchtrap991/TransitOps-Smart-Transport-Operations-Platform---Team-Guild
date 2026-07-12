const mongoose = require('mongoose');
const { Schema } = mongoose;

const maintenanceLogSchema = new Schema({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
});

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
