const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const MaintenanceLog = require('../models/MaintenanceLog');
const ExpenseLog = require('../models/ExpenseLog');

// @desc    Reset database to default demo state
// @route   POST /api/demo/reset
// @access  Public (for demo purposes)
const resetDemoDatabase = async (req, res) => {
  try {
    // 1. Clear all existing data
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await ExpenseLog.deleteMany({});

    // 2. Insert 10 Vehicles
    const vehiclesData = [
      { registrationNumber: 'VAN-05', model: 'Ford Transit', type: 'Van', maxLoadCapacity: 500, odometer: 45000, acquisitionCost: 35000, status: 'Available' },
      { registrationNumber: 'TRK-01', model: 'Volvo FH16', type: 'Truck', maxLoadCapacity: 10000, odometer: 125000, acquisitionCost: 120000, status: 'Available' },
      { registrationNumber: 'TRK-02', model: 'Mercedes Actros', type: 'Truck', maxLoadCapacity: 8000, odometer: 95000, acquisitionCost: 110000, status: 'On Trip' },
      { registrationNumber: 'BUS-01', model: 'Volvo 9900', type: 'Bus', maxLoadCapacity: 2000, odometer: 50000, acquisitionCost: 85000, status: 'Available' },
      { registrationNumber: 'VAN-02', model: 'Mercedes Sprinter', type: 'Van', maxLoadCapacity: 1200, odometer: 30000, acquisitionCost: 40000, status: 'Available' },
      { registrationNumber: 'TRL-01', model: 'Krone Profiliner', type: 'Trailer', maxLoadCapacity: 9000, odometer: 60000, acquisitionCost: 50000, status: 'In Shop' },
      { registrationNumber: 'PCK-01', model: 'Ford F-150', type: 'Pickup', maxLoadCapacity: 800, odometer: 15000, acquisitionCost: 30000, status: 'Available' },
      { registrationNumber: 'TNK-01', model: 'Scania R500', type: 'Tanker', maxLoadCapacity: 10000, odometer: 200000, acquisitionCost: 150000, status: 'Retired' },
      { registrationNumber: 'VAN-03', model: 'VW Crafter', type: 'Van', maxLoadCapacity: 1000, odometer: 20000, acquisitionCost: 38000, status: 'Available' },
      { registrationNumber: 'TRK-03', model: 'MAN TGX', type: 'Truck', maxLoadCapacity: 8500, odometer: 80000, acquisitionCost: 105000, status: 'On Trip' },
    ];
    const createdVehicles = await Vehicle.insertMany(vehiclesData);

    // 3. Insert 10 Drivers
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    const driversData = [
      { name: 'Alex Johnson', licenseNumber: 'DL-ALX-001', licenseCategory: 'CE', licenseExpiryDate: futureDate, contactNumber: '+1 555-0101', safetyScore: 95, status: 'Available' },
      { name: 'Sarah Miller', licenseNumber: 'DL-SRH-002', licenseCategory: 'C', licenseExpiryDate: pastDate, contactNumber: '+1 555-0102', safetyScore: 88, status: 'Available' }, // Expired
      { name: 'Mike Davis', licenseNumber: 'DL-MIK-003', licenseCategory: 'D', licenseExpiryDate: futureDate, contactNumber: '+1 555-0103', safetyScore: 45, status: 'Available' }, // Low score
      { name: 'John Doe', licenseNumber: 'DL-JHN-004', licenseCategory: 'CE', licenseExpiryDate: futureDate, contactNumber: '+1 555-0104', safetyScore: 100, status: 'Suspended' }, // Suspended
      { name: 'Emily Clark', licenseNumber: 'DL-EML-005', licenseCategory: 'B', licenseExpiryDate: futureDate, contactNumber: '+1 555-0105', safetyScore: 92, status: 'Available' },
      { name: 'David Smith', licenseNumber: 'DL-DVD-006', licenseCategory: 'CE', licenseExpiryDate: futureDate, contactNumber: '+1 555-0106', safetyScore: 85, status: 'On Trip' },
      { name: 'Anna Lee', licenseNumber: 'DL-ANN-007', licenseCategory: 'C1', licenseExpiryDate: futureDate, contactNumber: '+1 555-0107', safetyScore: 98, status: 'Available' },
      { name: 'Tom Wilson', licenseNumber: 'DL-TOM-008', licenseCategory: 'D1', licenseExpiryDate: futureDate, contactNumber: '+1 555-0108', safetyScore: 75, status: 'Off Duty' },
      { name: 'Lisa Taylor', licenseNumber: 'DL-LSA-009', licenseCategory: 'CE', licenseExpiryDate: futureDate, contactNumber: '+1 555-0109', safetyScore: 90, status: 'On Trip' },
      { name: 'James Brown', licenseNumber: 'DL-JMS-010', licenseCategory: 'C', licenseExpiryDate: futureDate, contactNumber: '+1 555-0110', safetyScore: 82, status: 'Available' },
    ];
    const createdDrivers = await Driver.insertMany(driversData);

    // 4. Insert 15+ Completed Trips
    const tripsData = [];
    for (let i = 0; i < 15; i++) {
      const v = createdVehicles[i % 5];
      const d = createdDrivers[i % 5];
      tripsData.push({
        source: `Warehouse ${String.fromCharCode(65 + (i % 3))}`,
        destination: `Client ${i + 1}`,
        vehicle: v._id,
        driver: d._id,
        cargoWeight: Math.floor(Math.random() * (v.maxLoadCapacity * 0.8)) + 100,
        plannedDistance: Math.floor(Math.random() * 400) + 50,
        status: 'Completed',
      });
    }
    await Trip.insertMany(tripsData);

    // 5. Insert 20+ Expense Logs
    const expensesData = [];
    for (let i = 0; i < 20; i++) {
      const v = createdVehicles[i % 8];
      const isFuel = i % 2 === 0;
      expensesData.push({
        vehicle: v._id,
        type: isFuel ? 'Fuel' : 'Toll',
        liters: isFuel ? Math.floor(Math.random() * 50) + 20 : null,
        cost: isFuel ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 20) + 5,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      });
    }
    await ExpenseLog.insertMany(expensesData);

    // 6. Insert 3 Closed Maintenance Records
    const maintenanceData = [
      { vehicle: createdVehicles[0]._id, description: 'Oil change and filter replacement', cost: 150, status: 'Closed' },
      { vehicle: createdVehicles[1]._id, description: 'Brake pads replacement', cost: 450, status: 'Closed' },
      { vehicle: createdVehicles[3]._id, description: 'Tire rotation and alignment', cost: 200, status: 'Closed' },
    ];
    await MaintenanceLog.insertMany(maintenanceData);

    res.status(200).json({ message: 'Demo data seeded successfully' });
  } catch (error) {
    console.error('Demo Reset Error:', error);
    res.status(500).json({ message: 'Failed to reset demo data', error: error.message });
  }
};

module.exports = {
  resetDemoDatabase
};
