// Simple test script for the timetable API
// Run with: node test-api.js

const testData = {
  courses: [
    { code: "CS101", name: "Intro to CS", durationSlots: 1, teacherCode: "T1", batch: "B1" },
    { code: "CS102", name: "Data Structures", durationSlots: 1, teacherCode: "T2", batch: "B1" }
  ],
  teachers: [
    { code: "T1", name: "Dr. Smith" },
    { code: "T2", name: "Dr. Jones" }
  ],
  rooms: [
    { name: "R101", capacity: 40 },
    { name: "R102", capacity: 50 }
  ],
  constraintsText: "No teacher conflicts, no room conflicts, prefer mid-day slots."
};

async function testGenerate() {
  console.log("Testing /api/timetables/generate...\n");
  
  try {
    const response = await fetch("http://localhost:4000/api/timetables/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    
    console.log("✅ Response received:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.timetable && data.timetable.length > 0) {
      console.log("\n✅ Timetable generated successfully!");
      console.log(`   Events: ${data.timetable.length}`);
      console.log(`   Conflicts: ${data.metrics.conflicts}`);
      console.log(`   Violations: ${data.hardViolations.length}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\nMake sure:");
    console.log("1. Backend server is running (npm run dev)");
    console.log("2. GEMINI_API_KEY is set in .env");
    console.log("3. MongoDB is connected");
  }
}

async function testHealth() {
  console.log("Testing /api/health...\n");
  
  try {
    const response = await fetch("http://localhost:4000/api/health");
    const data = await response.json();
    console.log("✅ Health check:", data);
    console.log("");
  } catch (error) {
    console.error("❌ Server not running. Start with: npm run dev\n");
    process.exit(1);
  }
}

// Run tests
(async () => {
  await testHealth();
  await testGenerate();
})();
