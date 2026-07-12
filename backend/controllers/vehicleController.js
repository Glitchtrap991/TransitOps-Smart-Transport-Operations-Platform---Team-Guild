const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles (with optional filters)
// @route   GET /api/vehicles
// @access  Protected
const getVehicles = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ registrationNumber: 1 });
    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Protected
const createVehicle = async (req, res) => {
  try {
    const { registrationNumber, model, type, maxLoadCapacity, odometer, acquisitionCost } = req.body;

    // Check for duplicate registration number
    const existing = await Vehicle.findOne({ registrationNumber });
    if (existing) {
      return res.status(400).json({ message: `Vehicle with registration number '${registrationNumber}' already exists` });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      model,
      type,
      maxLoadCapacity,
      odometer: odometer || 0,
      acquisitionCost,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create vehicle error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Protected
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // If updating registrationNumber, check for duplicates
    if (req.body.registrationNumber && req.body.registrationNumber !== vehicle.registrationNumber) {
      const existing = await Vehicle.findOne({ registrationNumber: req.body.registrationNumber });
      if (existing) {
        return res.status(400).json({ message: `Vehicle with registration number '${req.body.registrationNumber}' already exists` });
      }
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedVehicle);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Update vehicle error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Protected
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    console.error('Delete vehicle error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getVehicles, createVehicle, updateVehicle, deleteVehicle };
