const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const MaintenanceLog = require('../models/MaintenanceLog');
const ExpenseLog = require('../models/ExpenseLog');

// @desc    Get License Alerts (expiring in 30 days or expired)
// @route   GET /api/analytics/license-alerts
// @access  Protected
const getLicenseAlerts = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const drivers = await Driver.find({
      licenseExpiryDate: { $lte: thirtyDaysFromNow }
    }).select('name licenseNumber licenseExpiryDate status');

    if (drivers.length > 0) {
      console.log(`[ALERT HOOK] Found ${drivers.length} drivers with expiring/expired licenses. Sending email notifications...`);
    }

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all active system alerts
// @route   GET /api/analytics/system-alerts
// @access  Protected
const getSystemAlerts = async (req, res) => {
  try {
    const alerts = [];
    
    // 1. Expiring/Expired Licenses
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringDrivers = await Driver.find({
      licenseExpiryDate: { $lte: thirtyDaysFromNow }
    }).select('name licenseExpiryDate');
    
    expiringDrivers.forEach(d => {
      const isExpired = new Date(d.licenseExpiryDate) < new Date();
      const days = Math.ceil((new Date(d.licenseExpiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `lic-${d._id}`,
        type: 'warning',
        message: isExpired 
          ? `⚠️ Driver ${d.name}'s commercial license has expired!` 
          : `⚠️ Driver ${d.name}'s commercial license expires in ${days} days`
      });
    });

    // 2. Suspended Drivers
    const suspendedDrivers = await Driver.find({ status: 'Suspended' }).select('name');
    suspendedDrivers.forEach(d => {
      alerts.push({
        id: `susp-${d._id}`,
        type: 'critical',
        message: `🚨 Driver ${d.name} is currently marked Suspended and locked from dispatch`
      });
    });

    // 3. Vehicles in Shop
    const inShopVehicles = await Vehicle.find({ status: 'In Shop' }).select('registrationNumber');
    inShopVehicles.forEach(v => {
      alerts.push({
        id: `shop-${v._id}`,
        type: 'info',
        message: `🔧 Vehicle ${v.registrationNumber} is currently In Shop for scheduled maintenance`
      });
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get ROI and Financial Analytics per Vehicle
// @route   GET /api/analytics/roi
// @access  Protected
const getROI = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    
    // Aggregate Maintenance Costs
    const maintenanceData = await MaintenanceLog.aggregate([
      { $group: { _id: '$vehicle', totalMaintenance: { $sum: '$cost' } } }
    ]);
    
    // Aggregate Fuel Costs and Liters
    const fuelData = await ExpenseLog.aggregate([
      { $match: { type: 'Fuel' } },
      { $group: { 
          _id: '$vehicle', 
          totalFuelCost: { $sum: '$cost' },
          totalLiters: { $sum: '$liters' }
      }}
    ]);

    const analytics = vehicles.map(vehicle => {
      const maint = maintenanceData.find(m => m._id.toString() === vehicle._id.toString());
      const fuel = fuelData.find(f => f._id.toString() === vehicle._id.toString());
      
      const totalMaintenance = maint ? maint.totalMaintenance : 0;
      const totalFuel = fuel ? fuel.totalFuelCost : 0;
      const totalLiters = fuel ? fuel.totalLiters : 0;
      
      const totalOperationalCost = totalMaintenance + totalFuel;
      
      // Mock Revenue logic: $100 per km on odometer (just a dummy formula)
      const revenue = (vehicle.odometer || 0) * 100;
      
      // ROI = (Revenue - Operational Cost) / Acquisition Cost
      let roi = 0;
      if (vehicle.acquisitionCost > 0) {
        roi = ((revenue - totalOperationalCost) / vehicle.acquisitionCost) * 100;
      }
      
      // Fuel Efficiency (km/L)
      let fuelEfficiency = 0;
      if (totalLiters > 0) {
        fuelEfficiency = vehicle.odometer / totalLiters;
      }

      return {
        vehicleId: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        model: vehicle.model,
        status: vehicle.status,
        acquisitionCost: vehicle.acquisitionCost,
        totalMaintenance,
        totalFuel,
        totalOperationalCost,
        revenue,
        roi: Number(roi.toFixed(2)),
        fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
        odometer: vehicle.odometer
      };
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getLicenseAlerts,
  getSystemAlerts,
  getROI,
};
