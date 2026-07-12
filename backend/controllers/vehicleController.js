const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles with optional filtering
// @route   GET /api/vehicles
// @access  Protected
const getVehicles = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const filter = {};

    if (status) {
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Protected
const createVehicle = async (req, res) => {
  try {
    const { registrationNumber, model, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;

    // Check for duplicate registration number
    const existingVehicle = await Vehicle.findOne({ registrationNumber });
    if (existingVehicle) {
      return res.status(400).json({ message: `Vehicle with registration number '${registrationNumber}' already exists` });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      model,
      type,
      maxLoadCapacity,
      odometer: odometer || 0,
      acquisitionCost,
      status: status || 'Available',
    });

    res.status(201).json(vehicle);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add document to vehicle
// @route   POST /api/vehicles/:id/documents
// @access  Protected
const addDocument = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;
    
    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Title and fileUrl are required' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.documents.push({ title, fileUrl });
    await vehicle.save();

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getVehicles, createVehicle, updateVehicle, deleteVehicle, addDocument };
