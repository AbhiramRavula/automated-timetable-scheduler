import mongoose from 'mongoose';
import Timetable from './server/src/models/Timetable';
import dotenv from 'dotenv';
dotenv.config();

async function checkLatest() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-db');
  const latest = await Timetable.findOne().sort({ createdAt: -1 });
  if (!latest) {
    console.log("No timetable found");
    process.exit(0);
  }
  
  console.log("Latest Generation:", latest.metadata?.generatedAt);
  const grid = latest.grid;
  const batches = Object.keys(grid);
  
  batches.forEach(batch => {
    const batchData = grid[batch];
    console.log(`\nBatch: ${batch}`);
    console.log(`Legend Count: ${batchData.faculty_mapping?.length}`);
    
    // Check for fillers on Sat/Fri
    const schedule = batchData.schedule;
    ['FRI', 'SAT'].forEach(day => {
      const row = schedule[day] || [];
      const libSlots = row.filter((s: any) => s && (s === 'LIB' || s.subject === 'LIB'));
      const sportsSlots = row.filter((s: any) => s && (s === 'SPORTS' || s.subject === 'SPORTS'));
      console.log(`${day} - LIB: ${libSlots.length}, SPORTS: ${sportsSlots.length}`);
    });
  });
  
  process.exit(0);
}

checkLatest();
