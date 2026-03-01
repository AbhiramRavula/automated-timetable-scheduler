import mongoose from "mongoose";
import dotenv from "dotenv";
import Teacher from "./models/Teacher";
import Batch from "./models/Batch";
import Course from "./models/Course";
import Room from "./models/Room";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/timetable-scheduler";

const roomData = [
  { name: "301", capacity: 70, type: "lecture" },
  { name: "201", capacity: 70, type: "lecture" },
  { name: "202", capacity: 70, type: "lecture" },
  { name: "101", capacity: 70, type: "lecture" },
  { name: "102", capacity: 70, type: "lecture" },
  { name: "IoT Lab", capacity: 35, type: "lab" },
  { name: "AI Lab", capacity: 35, type: "lab" },
  { name: "OS Lab", capacity: 35, type: "lab" },
  { name: "FSD Lab", capacity: 35, type: "lab" },
  { name: "BE Lab", capacity: 35, type: "lab" },
  { name: "Python Lab", capacity: 35, type: "lab" },
  { name: "DB Lab", capacity: 35, type: "lab" },
];

const facultyData = [
  { name: "Mr. V. Gopinath", code: "VG", dept: "IT" },
  { name: "Mrs. Y. Sirisha", code: "YS", dept: "IT" },
  { name: "Dr. M. Krishna", code: "MK", dept: "IT" },
  { name: "Mrs. M. Srividya", code: "MSV", dept: "IT" },
  { name: "Ms. J. Nagalaxmi", code: "JN", dept: "IT" },
  { name: "Mrs. S. Nagajyothi", code: "SNJ", dept: "IT" },
  { name: "Mrs. T. Aruna Jyothi", code: "TAJ", dept: "IT" },
  { name: "Dr. J. Srinivas", code: "JS", dept: "IT" },
  { name: "Mr. A. Rajesh", code: "AR", dept: "IT" },
  { name: "Dr. K. Durga Prasad", code: "KDP", dept: "IT" },
  { name: "Mr. K. Durga Prasad", code: "KDP2", dept: "IT" },
  { name: "Ms. T. Vijayalaxmi", code: "TVL", dept: "IT" },
  { name: "Mrs. K. Mounika", code: "KM", dept: "IT" },
  { name: "Mrs. S. Sirisha", code: "SS", dept: "IT" },
  { name: "Ms. T. Vijaya Laxmi", code: "TVL2", dept: "IT" },
  { name: "Mrs. STVSAV Ramya", code: "SR", dept: "IT" },
  { name: "Dr. K. Koteswara Rao", code: "KKR", dept: "IT" },
  { name: "Dr. Pallavi Khare", code: "PK", dept: "IT" },
  { name: "Dr. N. Shribala", code: "NS", dept: "IT" },
  { name: "Dr. M. Naresh", code: "MN", dept: "IT" },
  { name: "Dr. CH Rajini Prashanth", code: "CRP", dept: "IT" },
  { name: "Mrs. K. Sunitha", code: "KS", dept: "IT" },
  { name: "Mrs. J. Shailaja", code: "JS2", dept: "IT" },
  { name: "Mrs. A S Keerthi Nayani", code: "ASKN", dept: "IT" },
  { name: "New Faculty A", code: "NFA", dept: "IT" },
  { name: "New Faculty B", code: "NFB", dept: "IT" },
];

const batchData = [
  { name: "VII SEM", year: 4, semester: "7", room: "301", classTeacher: "Mr. V. Gopinath", effectiveDate: "2024-03-01" },
  { name: "V SEM Sec A", year: 3, semester: "5", room: "201", classTeacher: "Dr. J. Srinivas", effectiveDate: "2024-03-01" },
  { name: "V SEM Sec B", year: 3, semester: "5", room: "202", classTeacher: "Mr. V. Gopinath", effectiveDate: "2024-03-01" },
  { name: "III SEM Sec A", year: 2, semester: "3", room: "101", classTeacher: "Ms. T. Vijaya Laxmi", effectiveDate: "2024-03-01" },
  { name: "III SEM Sec B", year: 2, semester: "3", room: "102", classTeacher: "Mr. V. Gopinath", effectiveDate: "2024-03-01" },
];

const subjectsData = [
  // VII SEM
  { code: "IOT", name: "Internet of Things", batch: "VII SEM", teacherCodes: ["VG"] },
  { code: "BDA", name: "Big Data Analytics", batch: "VII SEM", teacherCodes: ["YS"] },
  { code: "ENT", name: "Entrepreneurship", batch: "VII SEM", teacherCodes: ["MK"] },
  { code: "NLP", name: "Natural Language Processing", batch: "VII SEM", teacherCodes: ["MSV"] },
  { code: "SPM", name: "Software Project Management", batch: "VII SEM", teacherCodes: ["JN"] },
  { code: "IOT-LAB", name: "Internet of Things Lab", batch: "VII SEM", teacherCodes: ["VG"] },
  { code: "PW-I", name: "Project Work - I", batch: "VII SEM", teacherCodes: ["SNJ", "TAJ"] },

  // V SEM Sec A
  { code: "PPL-A", name: "Principles of Programming Languages", batch: "V SEM Sec A", teacherCodes: ["JS"] },
  { code: "AI-A", name: "Artificial Intelligence", batch: "V SEM Sec A", teacherCodes: ["MSV"] },
  { code: "OS-A", name: "Operating Systems", batch: "V SEM Sec A", teacherCodes: ["AR"] },
  { code: "SE-A", name: "Software Engineering", batch: "V SEM Sec A", teacherCodes: ["KDP"] },
  { code: "FSD-A", name: "Full Stack Development", batch: "V SEM Sec A", teacherCodes: ["TVL"] },
  { code: "OOAD-A", name: "Object Oriented Analysis and Design", batch: "V SEM Sec A", teacherCodes: ["SS"] },
  { code: "AI-LAB-A", name: "Artificial Intelligence Lab", batch: "V SEM Sec A", teacherCodes: ["MSV"] },
  { code: "OS-LAB-A", name: "Operating System Lab", batch: "V SEM Sec A", teacherCodes: ["AR", "KDP"] },
  { code: "FSD-LAB-A", name: "Full Stack Development Lab", batch: "V SEM Sec A", teacherCodes: ["TVL", "JN"] },

  // V SEM Sec B
  { code: "PPL-B", name: "Principles of Programming Languages", batch: "V SEM Sec B", teacherCodes: ["VG"] },
  { code: "AI-B", name: "Artificial Intelligence", batch: "V SEM Sec B", teacherCodes: ["JS"] },
  { code: "OS-B", name: "Operating Systems", batch: "V SEM Sec B", teacherCodes: ["SNJ"] },
  { code: "SE-B", name: "Software Engineering", batch: "V SEM Sec B", teacherCodes: ["KDP2"] },
  { code: "FSD-B", name: "Full Stack Development", batch: "V SEM Sec B", teacherCodes: ["KM"] },
  { code: "OOAD-B", name: "Object Oriented Analysis and Design", batch: "V SEM Sec B", teacherCodes: ["TAJ"] },
  { code: "AI-LAB-B", name: "Artificial Intelligence Lab", batch: "V SEM Sec B", teacherCodes: ["JS", "SR"] },
  { code: "OS-LAB-B", name: "Operating System Lab", batch: "V SEM Sec B", teacherCodes: ["SNJ"] },
  { code: "FSD-LAB-B", name: "Full Stack Development Lab", batch: "V SEM Sec B", teacherCodes: ["KM", "TAJ"] },

  // III SEM Sec A
  { code: "ETCE-A", name: "Effective Technical Communication in English", batch: "III SEM Sec A", teacherCodes: ["CRP"] },
  { code: "FA-A", name: "Finance and Accounting", batch: "III SEM Sec A", teacherCodes: ["NFA"] },
  { code: "BE-A", name: "Basic Electronics", batch: "III SEM Sec A", teacherCodes: ["KKR"] },
  { code: "DE-A", name: "Digital Electronics", batch: "III SEM Sec A", teacherCodes: ["NS"] },
  { code: "DBS-A", name: "Database Systems", batch: "III SEM Sec A", teacherCodes: ["YS"] },
  { code: "PP-A", name: "Python Programming", batch: "III SEM Sec A", teacherCodes: ["TVL2"] },
  { code: "DM-A", name: "Discrete Mathematics", batch: "III SEM Sec A", teacherCodes: ["SR"] },
  { code: "BE-LAB-A", name: "Basic Electronics Lab", batch: "III SEM Sec A", teacherCodes: ["KKR", "JS2"] }, 
  { code: "PP-LAB-A", name: "Python Programming Lab", batch: "III SEM Sec A", teacherCodes: ["TVL2", "MSV"] },
  { code: "DBS-LAB-A", name: "Database Systems Lab", batch: "III SEM Sec A", teacherCodes: ["YS", "AR", "JN"] },

  // III SEM Sec B
  { code: "ETCE-B", name: "Effective Technical Communication in English", batch: "III SEM Sec B", teacherCodes: ["KS"] },
  { code: "FA-B", name: "Finance and Accounting", batch: "III SEM Sec B", teacherCodes: ["NFB"] },
  { code: "BE-B", name: "Basic Electronics", batch: "III SEM Sec B", teacherCodes: ["PK"] },
  { code: "DE-B", name: "Digital Electronics", batch: "III SEM Sec B", teacherCodes: ["MN"] },
  { code: "DBS-B", name: "Database Systems", batch: "III SEM Sec B", teacherCodes: ["KM"] },
  { code: "PP-B", name: "Python Programming", batch: "III SEM Sec B", teacherCodes: ["VG"] },
  { code: "DM-B", name: "Discrete Mathematics", batch: "III SEM Sec B", teacherCodes: ["AR"] },
  { code: "BE-LAB-B", name: "Basic Electronics Lab", batch: "III SEM Sec B", teacherCodes: ["PK", "ASKN"] },
  { code: "PP-LAB-B", name: "Python Programming Lab", batch: "III SEM Sec B", teacherCodes: ["VG"] },
  { code: "DBS-LAB-B", name: "Database Systems Lab", batch: "III SEM Sec B", teacherCodes: ["KM", "AR", "YS", "TVL2"] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Teacher.deleteMany({});
    await Batch.deleteMany({});
    await Course.deleteMany({});
    await Room.deleteMany({});
    console.log("Cleared existing data");

    // Seed Rooms
    await Room.insertMany(roomData);
    console.log("Seeded Rooms");

    // Seed Teachers
    const teachers = facultyData.map(f => ({
      name: f.name,
      code: f.code,
      department: f.dept,
      designation: f.dept === "IT" ? "Assistant Professor" : "Lecturer"
    }));
    await Teacher.insertMany(teachers);
    console.log("Seeded Faculty");

    // Seed Batches
    await Batch.insertMany(batchData);
    console.log("Seeded Batches");

    // Seed Subjects
    const subjects = subjectsData.map(s => {
      const isLab = s.code.includes("LAB") || s.name.toLowerCase().includes("lab");
      const isProject = s.code.includes("PW");
      return {
        ...s,
        type: isProject ? "project" : (isLab ? "lab" : "lecture"),
        sessionsPerWeek: isLab ? 1 : 3, // Labs once a week (2 periods), Theory 3 times
        durationSlots: isLab ? 2 : 1,
        preferredRoomTypes: [isLab ? "lab" : "lecture"],
        priority: "core"
      };
    });
    await Course.insertMany(subjects);
    console.log("Seeded Subjects");

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
