import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-scheduler';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed (db is undefined)');
    }

    const institutionsColl = db.collection('institutions');

    // Check if any institutions exist
    const count = await institutionsColl.countDocuments();
    if (count > 0) {
      console.log('Institutions already exist. Skipping seed.');
      process.exit(0);
    }

    console.log('Seeding default institution...');
    const result = await institutionsColl.insertOne({
      name: 'Main Campus',
      code: 'MAIN',
      address: 'Default Address',
      departments: [
        { id: 'dept-1', name: 'Computer Science' },
        { id: 'dept-2', name: 'Electronics' }
      ],
      settings: {
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`Successfully seeded default institution with ID: ${result.insertedId}`);
    
    // Optional: Update all existing records to this institutionId if they don't have one
    const institutionId = result.insertedId;
    const collections = ['faculties', 'subjects', 'batches', 'rooms', 'timetables'];
    
    for (const collName of collections) {
      const coll = db.collection(collName);
      const updateResult = await coll.updateMany(
        { institutionId: { $exists: false } },
        { $set: { institutionId: institutionId } }
      );
      console.log(`Updated ${updateResult.modifiedCount} documents in ${collName} with new institutionId.`);
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
