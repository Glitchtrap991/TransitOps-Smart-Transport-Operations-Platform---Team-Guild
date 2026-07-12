const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const ExpenseLog = require('../models/ExpenseLog');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Protected
const getTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .populate('vehicle', 'registrationNumber model maxLoadCapacity')
      .populate('driver', 'name licenseNumber status')
      .sort({ _id: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Protected
const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle, driver, cargoWeight, plannedDistance } = req.body;

    // Verify Vehicle
    const selectedVehicle = await Vehicle.findById(vehicle);
    if (!selectedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (selectedVehicle.status !== 'Available') {
      return res.status(400).json({ message: `Vehicle is ${selectedVehicle.status} and cannot be assigned.` });
    }
    if (Number(cargoWeight) > selectedVehicle.maxLoadCapacity) {
      return res.status(400).json({ message: `Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${selectedVehicle.maxLoadCapacity} kg).` });
    }

    // Verify Driver
    const selectedDriver = await Driver.findById(driver);
    if (!selectedDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    if (selectedDriver.status !== 'Available') {
      return res.status(400).json({ message: `Driver is ${selectedDriver.status} and cannot be assigned.` });
    }
    if (new Date(selectedDriver.licenseExpiryDate) < new Date()) {
      return res.status(400).json({ message: 'Driver license has expired.' });
    }

    const trip = await Trip.create({
      source,
      destination,
      vehicle,
      driver,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      status: 'Draft',
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber model maxLoadCapacity')
      .populate('driver', 'name licenseNumber status');

    res.status(201).json(populatedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Dispatch a trip
// @route   PUT /api/trips/:id/dispatch
// @access  Protected
const dispatchTrip = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const trip = await Trip.findById(req.params.id).session(session);

    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.status !== 'Draft') {
      await session.abortTransaction();
      return res.status(400).json({ message: `Cannot dispatch trip in ${trip.status} status` });
    }

    trip.status = 'Dispatched';
    await trip.save({ session });

    // Update Vehicle
    await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'On Trip' }, { session });

    // Update Driver
    await Driver.findByIdAndUpdate(trip.driver, { status: 'On Trip' }, { session });

    await session.commitTransaction();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber model maxLoadCapacity')
      .populate('driver', 'name licenseNumber status');
      
    res.json(updatedTrip);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Complete a trip
// @route   PUT /api/trips/:id/complete
// @access  Protected
const completeTrip = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { finalOdometer, fuelLiters, fuelCost } = req.body;
    
    const trip = await Trip.findById(req.params.id).session(session);

    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.status !== 'Dispatched') {
      await session.abortTransaction();
      return res.status(400).json({ message: `Cannot complete trip in ${trip.status} status` });
    }

    trip.status = 'Completed';
    await trip.save({ session });

    // Update Vehicle
    await Vehicle.findByIdAndUpdate(
      trip.vehicle, 
      { status: 'Available', odometer: Number(finalOdometer) }, 
      { session }
    );

    // Update Driver
    await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' }, { session });

    // Log Fuel Expense if provided
    if (fuelCost && Number(fuelCost) > 0) {
      await ExpenseLog.create([{
        vehicle: trip.vehicle,
        type: 'Fuel',
        liters: Number(fuelLiters) || null,
        cost: Number(fuelCost)
      }], { session });
    }

    await session.commitTransaction();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber model maxLoadCapacity')
      .populate('driver', 'name licenseNumber status');

    res.json(updatedTrip);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Cancel a trip
// @route   PUT /api/trips/:id/cancel
// @access  Protected
const cancelTrip = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const trip = await Trip.findById(req.params.id).session(session);

    if (!trip) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ message: `Cannot cancel trip in ${trip.status} status` });
    }

    const previousStatus = trip.status;
    trip.status = 'Cancelled';
    await trip.save({ session });

    // Revert statuses only if the trip was dispatched
    if (previousStatus === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' }, { session });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' }, { session });
    }

    await session.commitTransaction();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber model maxLoadCapacity')
      .populate('driver', 'name licenseNumber status');

    res.json(updatedTrip);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
