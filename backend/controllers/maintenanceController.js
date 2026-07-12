const mongoose = require('mongoose');
const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Protected
const getMaintenanceLogs = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find()
      .populate('vehicle', 'registrationNumber model status')
      .sort({ _id: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a maintenance log
// @route   POST /api/maintenance
// @access  Protected
const createLog = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { vehicle, description, cost } = req.body;

    const selectedVehicle = await Vehicle.findById(vehicle).session(session);
    if (!selectedVehicle) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (selectedVehicle.status !== 'Available') {
      await session.abortTransaction();
      return res.status(400).json({ message: `Cannot put vehicle in shop. Current status: ${selectedVehicle.status}` });
    }

    const log = await MaintenanceLog.create([{
      vehicle,
      description,
      cost: Number(cost),
      status: 'Open',
    }], { session });

    // Update vehicle status
    selectedVehicle.status = 'In Shop';
    await selectedVehicle.save({ session });

    await session.commitTransaction();

    const populatedLog = await MaintenanceLog.findById(log[0]._id)
      .populate('vehicle', 'registrationNumber model status');

    res.status(201).json(populatedLog);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Close a maintenance log
// @route   PUT /api/maintenance/:id/close
// @access  Protected
const closeLog = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const log = await MaintenanceLog.findById(req.params.id).session(session);

    if (!log) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Log not found' });
    }

    if (log.status === 'Closed') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Log is already closed' });
    }

    log.status = 'Closed';
    await log.save({ session });

    // Update vehicle status back to Available
    const vehicle = await Vehicle.findById(log.vehicle).session(session);
    if (vehicle && vehicle.status === 'In Shop') {
      vehicle.status = 'Available';
      await vehicle.save({ session });
    }

    await session.commitTransaction();

    const updatedLog = await MaintenanceLog.findById(log._id)
      .populate('vehicle', 'registrationNumber model status');

    res.json(updatedLog);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getMaintenanceLogs,
  createLog,
  closeLog,
};
