const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseLogSchema = new Schema({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type: {
    type: String,
    enum: ['Fuel', 'Toll', 'Other'],
    required: true,
  },
  liters: { type: Number }, // only for Fuel
  cost: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExpenseLog', expenseLogSchema);
