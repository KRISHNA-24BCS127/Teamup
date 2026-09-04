// scripts/seed.js - Standalone MongoDB Seeder Script
require('dotenv').config();
const mongoose = require('mongoose');
const Teammate = require('../models/Teammate');
const { initialTeammates } = require('./seedData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quick-teams';

async function seed() {
  try {
    console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✅ Connected to MongoDB.');

    console.log('🧹 Clearing existing teammates...');
    await Teammate.deleteMany({});

    console.log(`🌱 Seeding ${initialTeammates.length} teammates...`);
    await Teammate.insertMany(initialTeammates);

    console.log('🎉 Database successfully seeded with teammates!');
    const count = await Teammate.countDocuments();
    console.log(`📊 Total teammates in database: ${count}`);

    await mongoose.connection.close();
    console.log('🔒 Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
