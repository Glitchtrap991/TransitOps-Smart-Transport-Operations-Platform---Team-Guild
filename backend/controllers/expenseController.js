const ExpenseLog = require('../models/ExpenseLog');
const Vehicle = require('../models/Vehicle');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Protected
const getExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseLog.find()
      .populate('vehicle', 'registrationNumber model')
      .sort({ _id: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new standalone expense
// @route   POST /api/expenses
// @access  Protected
const createExpense = async (req, res) => {
  try {
    const { vehicle, type, liters, cost } = req.body;
    
    const selectedVehicle = await Vehicle.findById(vehicle);
    if (!selectedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const expense = await ExpenseLog.create({
      vehicle,
      type,
      liters: type === 'Fuel' ? Number(liters) : null,
      cost: Number(cost),
    });

    const populatedExpense = await ExpenseLog.findById(expense._id)
      .populate('vehicle', 'registrationNumber model');

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getExpenses,
  createExpense,
};
