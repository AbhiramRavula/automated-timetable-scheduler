/**
 * Seed script — inserts the real department timetables AND batches into MongoDB.
 * Run with: npx ts-node src/seed.ts  (from the server folder)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Timetable from "./models/Timetable";
import Batch from "./models/Batch";

dotenv.config();

// ─── Timetable data (exact match to realMockData.ts including labs and SAT) ───
const TIMETABLE_SEED = {
  academic_year: "2025-2026",
  department: "Information Technology",
  timetables: [
    {
      class: "B.E VII SEM - IT",
      effective_date: "02/09/2025",
      class_teacher: "Mrs. STVSAV Ramya",
      schedule: {
        MON: ["SPM", "NLP", "ENT", "BDA", "LUNCH", "PW-I(A&B)", "PW-I(A&B)"],
        TUE: ["IOT", "BDA", "IOT LAB(A)/PW-I(B)", "IOT LAB(A)/PW-I(B)", "LUNCH", "ENT", "LIB"],
        WED: ["IOT LAB(B)/PW-I(A)", "IOT LAB(B)/PW-I(A)", "SPM", "NLP", "LUNCH", "LIB", "LIB"],
        THU: ["SPM", "IOT", "PW-I(A&B)", "PW-I(A&B)", "LUNCH", "SPORTS", "SPORTS"],
        FRI: ["BDA", "IOT", "NLP", "ENT", "LUNCH", "SPORTS", "SPORTS"],
      },
      faculty_mapping: [
        { code: "PC701IT", subject: "Internet of Things", abbr: "IOT", faculty: "Mr. V. Gopinath" },
        { code: "PC702IT", subject: "Big Data Analytics", abbr: "BDA", faculty: "Mrs. Y. Sirisha" },
        { code: "OE704ME", subject: "Entrepreneurship", abbr: "ENT", faculty: "Dr. M. Krishna" },
        { code: "PE 734 IT", subject: "Natural Language Processing", abbr: "NLP", faculty: "Mrs. M. Srividya" },
        { code: "PE 741 IT", subject: "Software Project Management", abbr: "SPM", faculty: "Ms. J. Nagalaxmi" },
      ],
    },
    {
      class: "B.E V SEM - IT SEC-A",
      room_no: "N 305",
      effective_date: "22/09/2025",
      class_teacher: "Mr. A. Rajesh",
      schedule: {
        MON: ["OOAD", "CRT", "SE", "PPL", "LUNCH", "OS", "LIB"],
        TUE: ["AI LAB(A)/OS LAB(B)/FSD LAB(C)", "AI LAB(A)/OS LAB(B)/FSD LAB(C)", "CRT", "AI", "LUNCH", "FSD", "SPORTS"],
        WED: ["CRT", "LIB", "SE", "PPL", "LUNCH", "AI LAB(A)/OS LAB(B)/FSD LAB(C)", "AI LAB(A)/OS LAB(B)/FSD LAB(C)"],
        THU: ["AI LAB(A)/OS LAB(B)/FSD LAB(C)", "AI LAB(A)/OS LAB(B)/FSD LAB(C)", "OOAD", "FSD", "LUNCH", "LIB", "LIB"],
        FRI: ["OS", "OOAD", "FSD", "AI", "LUNCH", "LIB", "LIB"],
        SAT: ["AI", "OS", "PPL", "SE", "LUNCH", "SPORTS", "SPORTS"],
      },
      faculty_mapping: [
        { code: "PC508ITU23", subject: "Principles of Programming Languages", abbr: "PPL", faculty: "Dr. J. Srinivas" },
        { code: "PC509IT U23", subject: "Artificial Intelligence", abbr: "AI", faculty: "Mrs. M. Srividya" },
        { code: "PC510IT U23", subject: "Operating Systems", abbr: "OS", faculty: "Mr. A. Rajesh" },
        { code: "PC511IT U23", subject: "Software Engineering", abbr: "SE", faculty: "Dr. K. Durga Prasad" },
        { code: "PC512IT U23", subject: "Full Stack Development", abbr: "FSD", faculty: "Ms. T. Vijayalaxmi" },
        { code: "PE501ITU23", subject: "Object oriented Analysis and Design", abbr: "OOAD", faculty: "Mrs. S. Sirisha" },
      ],
    },
    {
      class: "B.E V SEM - IT SEC-B",
      room_no: "N 313",
      effective_date: "22/09/2025",
      class_teacher: "Mrs. S. Nagajyothi",
      schedule: {
        MON: ["AI LAB(A)/OS LAB(B)/FSD LAB(C)", "AI LAB(A)/OS LAB(B)/FSD LAB(C)", "OS", "SE", "LUNCH", "LIB", "LIB"],
        TUE: ["OS", "AI", "OOAD", "SE", "LUNCH", "AI LAB(A)/OS LAB(B)/FSD LAB(C)", "AI LAB(A)/OS LAB(B)/FSD LAB(C)"],
        WED: ["AI", "CRT", "OOAD", "FSD", "LUNCH", "PPL", "LIB"],
        THU: ["LIB", "CRT", "FSD", "PPL", "LUNCH", "SPORTS", "SPORTS"],
        FRI: ["AI", "SE", "AI LAB(A)/OS LAB(B)/FSD LAB(C)", "AI LAB(A)/OS LAB(B)/FSD LAB(C)", "LUNCH", "CRT", "LIB"],
        SAT: ["OOAD", "OS", "PPL", "FSD", "LUNCH", "SPORTS", "SPORTS"],
      },
      faculty_mapping: [
        { code: "PC508ITU23", subject: "Principles of Programming Languages", abbr: "PPL", faculty: "Mr. V. Gopinath" },
        { code: "PC509IT U23", subject: "Artificial Intelligence", abbr: "AI", faculty: "Dr. J. Srinivas" },
        { code: "PC510IT U23", subject: "Operating Systems", abbr: "OS", faculty: "Mrs. S. Nagajyothi" },
        { code: "PC511IT U23", subject: "Software Engineering", abbr: "SE", faculty: "Mr. K. Durga Prasad" },
        { code: "PC512IT U23", subject: "Full Stack Development", abbr: "FSD", faculty: "Mrs. K. Mounika" },
        { code: "PE501ITU23", subject: "Object oriented Analysis and Design", abbr: "OOAD", faculty: "Mrs. T. Aruna Jyothi" },
      ],
    },
    {
      class: "B.E III SEM - IT SEC-A",
      room_no: "N-304",
      effective_date: "22/09/2025",
      class_teacher: "Ms. T. Vijaya Laxmi",
      schedule: {
        MON: ["PP", "DBS", "FA", "BE", "LUNCH", "DM", "LIB"],
        TUE: ["BE", "FA", "ETCE", "PP", "LUNCH", "CRT", "DE"],
        WED: ["PP", "DBS", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "LUNCH", "FA", "SPORTS"],
        THU: ["CRT", "FA", "DM", "DE", "LUNCH", "DBS", "LIB"],
        FRI: ["DE", "DM", "BE", "DBS", "LUNCH", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "BE LAB(A)/PP LAB(B)/DBS LAB(C)"],
        SAT: ["PP", "ETCE", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "LUNCH", "DM", "SPORTS"],
      },
      faculty_mapping: [
        { code: "HS301EGU23", subject: "Effective Technical Communication in English", abbr: "ETCE", faculty: "Dr. CH Rajini Prashanth" },
        { code: "HS301CMU23", subject: "Finance and Accounting", abbr: "FA", faculty: "New Faculty A" },
        { code: "ES303ECU23", subject: "Basic Electronics", abbr: "BE", faculty: "Dr. K. Koteswara Rao" },
        { code: "ES304ECU23", subject: "Digital Electronics", abbr: "DE", faculty: "Dr. N. Shribala" },
        { code: "PC302ITU23", subject: "Database Systems", abbr: "DBS", faculty: "Mrs. Y. Sirisha" },
        { code: "ES301ITU23", subject: "Python Programming", abbr: "PP", faculty: "Ms. T. Vijaya Laxmi" },
        { code: "PC303ITU23", subject: "Discrete Mathematics", abbr: "DM", faculty: "Mrs. STVSAV Ramya" },
      ],
    },
    {
      class: "B.E III SEM - IT SEC-B",
      room_no: "N 314",
      effective_date: "22/09/2025",
      class_teacher: "Mrs. K. Mounika",
      schedule: {
        MON: ["CRT", "ETCE", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "LUNCH", "PP", "LIB"],
        TUE: ["DBS", "PP", "FA", "DM", "LUNCH", "BE", "SPORTS"],
        WED: ["DM", "DBS", "PP", "BE", "LUNCH", "DE", "LIB"],
        THU: ["FA", "DBS", "DE", "LIB", "LUNCH", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "BE LAB(A)/PP LAB(B)/DBS LAB(C)"],
        FRI: ["DE", "DBS", "BE", "FA", "LUNCH", "CRT", "DM"],
        SAT: ["BE LAB(A)/PP LAB(B)/DBS LAB(C)", "BE LAB(A)/PP LAB(B)/DBS LAB(C)", "ETCE", "PP", "LUNCH", "DM", "SPORTS"],
      },
      faculty_mapping: [
        { code: "HS301EGU23", subject: "Effective Technical Communication in English", abbr: "ETCE", faculty: "Mrs. K. Sunitha" },
        { code: "ES303ECU23", subject: "Basic Electronics", abbr: "BE", faculty: "Dr. Pallavi Khare" },
        { code: "PC302ITU23", subject: "Database Systems", abbr: "DBS", faculty: "Mrs. K. Mounika" },
        { code: "ES301ITU23", subject: "Python Programming", abbr: "PP", faculty: "Mr. V. Gopinath" },
        { code: "PC303ITU23", subject: "Discrete Mathematics", abbr: "DM", faculty: "Mr. A. Rajesh" },
      ],
    },
  ],
};

// ─── Batch data (maps directly to the Batch model) ────────────────────────────
const BATCH_SEED = [
  { name: "B.E VII SEM - IT",      room: "N 301", classTeacher: "Mrs. STVSAV Ramya",   effectiveDate: "02/09/2025", semester: "VII", year: 4 },
  { name: "B.E V SEM - IT SEC-A",  room: "N 305", classTeacher: "Mr. A. Rajesh",       effectiveDate: "22/09/2025", semester: "V",   year: 3 },
  { name: "B.E V SEM - IT SEC-B",  room: "N 313", classTeacher: "Mrs. S. Nagajyothi",  effectiveDate: "22/09/2025", semester: "V",   year: 3 },
  { name: "B.E III SEM - IT SEC-A",room: "N-304", classTeacher: "Ms. T. Vijaya Laxmi", effectiveDate: "22/09/2025", semester: "III", year: 2 },
  { name: "B.E III SEM - IT SEC-B",room: "N 314", classTeacher: "Mrs. K. Mounika",     effectiveDate: "22/09/2025", semester: "III", year: 2 },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in .env");

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // ── Timetables ──
    await Timetable.deleteMany({ "grid.source": "seed" });
    const doc = new Timetable({
      courses: [],
      teachers: [],
      rooms: [],
      grid: {
        source: "seed",
        academic_year: TIMETABLE_SEED.academic_year,
        department: TIMETABLE_SEED.department,
        timetables: TIMETABLE_SEED.timetables,
      },
      constraintsSnapshot: {},
      metrics: { conflicts: 0, gapScore: 1, balanceScore: 1, softScore: 1 },
      createdAt: new Date(),
    });
    await doc.save();
    console.log("✅ Timetables seeded! ID:", doc._id);

    // ── Batches ──
    for (const batch of BATCH_SEED) {
      await Batch.findOneAndUpdate(
        { name: batch.name },
        batch,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${BATCH_SEED.length} batches seeded!`);

  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
