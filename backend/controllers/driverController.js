const Driver = require('../models/Driver');

// @desc    Get all drivers (with optional filters)
// @route   GET /api/drivers
// @access  Protected
const getDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await Driver.find(filter).sort({ name: 1 });
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new driver
// @route   POST /api/drivers
// @access  Protected
const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore } = req.body;

    // Check for duplicate license number
    const existing = await Driver.findOne({ licenseNumber });
    if (existing) {
      return res.status(400).json({ message: `Driver with license number '${licenseNumber}' already exists` });
    }

    const driver = await Driver.create({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: safetyScore !== undefined ? safetyScore : 100,
    });

    res.status(201).json(driver);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create driver error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a driver
// @route   PUT /api/drivers/:id
// @access  Protected
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // If updating licenseNumber, check for duplicates
    if (req.body.licenseNumber && req.body.licenseNumber !== driver.licenseNumber) {
      const existing = await Driver.findOne({ licenseNumber: req.body.licenseNumber });
      if (existing) {
        return res.status(400).json({ message: `Driver with license number '${req.body.licenseNumber}' already exists` });
      }
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedDriver);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Update driver error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Protected
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver removed' });
  } catch (error) {
    console.error('Delete driver error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDrivers, createDriver, updateDriver, deleteDriver };
