const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },
  type: {
    type: String,
    enum: ['Tolls', 'Insurance', 'Miscellaneous'],
    required: [true, 'Expense type is required']
  },
  cost: {
    type: Number,
    required: [true, 'Expense cost is required']
  },
  date: {
    type: Date,
    required: [true, 'Expense date is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
