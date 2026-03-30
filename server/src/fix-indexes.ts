import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/timetable-scheduler";

async function fixIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const collections = ["batches", "courses", "teachers", "rooms", "departments"];
    
    for (const colName of collections) {
      console.log(`\nChecking indexes for: ${colName}`);
      const collection = db.collection(colName);
      const indexes = await collection.indexes();
      
      for (const idx of indexes) {
        const isProblematicGlobal = idx.unique && Object.keys(idx.key).length === 1 && !idx.key.institutionId && ["name", "code"].includes(Object.keys(idx.key)[0]);
        const isProblematicCompound = idx.name === "code_1_batch_1_institutionId_1";

        if (isProblematicGlobal || isProblematicCompound) {
          console.log(`⚠️  Found problematic unique index: ${idx.name}. Dropping it...`);
          try {
            await collection.dropIndex(idx.name as string);
            console.log(`✅ Dropped ${idx.name}`);
          } catch (dropErr) {
            console.warn(`❌ Could not drop index ${idx.name}:`, dropErr);
          }
        }
      }
    }

    console.log("\nCleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

fixIndexes();
