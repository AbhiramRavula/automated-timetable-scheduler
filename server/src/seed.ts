/**
 * Seed script — inserts the real department timetables into MongoDB.
 * Run with: npx ts-node src/seed.ts  (from the server folder)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Timetable from "./models/Timetable";

dotenv.config();

const SEED_DATA = {
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
        MON: ["PPL", "AI", "OS", "SE", "LUNCH", "FSD", "FSD"],
        TUE: ["AI", "FSD", "OS LAB(A)/FSD(B)", "OS LAB(A)/FSD(B)", "LUNCH", "OOAD", "PPL"],
        WED: ["SE", "OS", "AI", "PPL", "LUNCH", "OOAD", "OOAD"],
        THU: ["OS", "PPL", "FSD", "AI", "LUNCH", "SPORTS", "SPORTS"],
        FRI: ["SE", "OS", "PPL", "FSD", "LUNCH", "SPORTS", "SPORTS"],
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
        MON: ["PPL", "OS", "SE", "AI", "LUNCH", "FSD", "FSD"],
        TUE: ["AI", "FSD", "OS LAB(B)/FSD(A)", "OS LAB(B)/FSD(A)", "LUNCH", "OOAD", "PPL"],
        WED: ["SE", "OS", "PPL", "AI", "LUNCH", "OOAD", "OOAD"],
        THU: ["OS", "AI", "FSD", "PPL", "LUNCH", "SPORTS", "SPORTS"],
        FRI: ["SE", "PPL", "OS", "FSD", "LUNCH", "SPORTS", "SPORTS"],
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
        MON: ["ETCE", "PP", "DBS", "DE", "LUNCH", "DM", "DM"],
        TUE: ["FA", "DBS", "PP LAB(A)/DE LAB(A)", "PP LAB(A)/DE LAB(A)", "LUNCH", "ETCE", "BE"],
        WED: ["DM", "DE", "FA", "DBS", "LUNCH", "PP", "PP"],
        THU: ["BE", "DM", "ETCE", "PP", "LUNCH", "SPORTS", "SPORTS"],
        FRI: ["DBS", "BE", "DE", "FA", "LUNCH", "SPORTS", "SPORTS"],
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
        MON: ["ETCE", "DBS", "PP", "DM", "LUNCH", "BE", "BE"],
        TUE: ["DM", "PP", "PP LAB(B)/BE LAB(B)", "PP LAB(B)/BE LAB(B)", "LUNCH", "DBS", "ETCE"],
        WED: ["DBS", "BE", "DM", "PP", "LUNCH", "ETCE", "ETCE"],
        THU: ["PP", "DM", "ETCE", "DBS", "LUNCH", "SPORTS", "SPORTS"],
        FRI: ["BE", "DBS", "PP", "DM", "LUNCH", "SPORTS", "SPORTS"],
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

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in .env");

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Clear existing seeded documents (optional — remove this line to keep old ones)
    await Timetable.deleteMany({ "grid.source": "seed" });

    // Store entire department timetable as one document.
    // The 'grid' field holds the array of class timetables.
    const doc = new Timetable({
      courses: [],
      teachers: [],
      rooms: [],
      grid: {
        source: "seed",
        academic_year: SEED_DATA.academic_year,
        department: SEED_DATA.department,
        timetables: SEED_DATA.timetables,
      },
      constraintsSnapshot: {},
      metrics: { conflicts: 0, gapScore: 1, balanceScore: 1, softScore: 1 },
      createdAt: new Date(),
    });

    await doc.save();
    console.log("✅ Seed data inserted successfully! ID:", doc._id);
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
