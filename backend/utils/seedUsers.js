// utils/seedUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedUsers = async () => {
    try {
        // Connect to MongoDB using the URI from your .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing users to avoid duplicate email errors
        await User.deleteMany();

        // Hash the default password 'password123'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Prepare the 4 required role accounts[cite: 1]
        const testUsers = [
            { email: 'manager@transitops.com', password: hashedPassword, role: 'Fleet Manager' },
            { email: 'driver@transitops.com', password: hashedPassword, role: 'Driver' },
            { email: 'safety@transitops.com', password: hashedPassword, role: 'Safety Officer' },
            { email: 'finance@transitops.com', password: hashedPassword, role: 'Financial Analyst' }
        ];

        // Insert into database
        await User.insertMany(testUsers);
        console.log('✅ 4 Test Users Seeded Successfully!');
        console.log('Default Password for all accounts: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();