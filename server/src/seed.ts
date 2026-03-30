import mongoose from "mongoose";
import dotenv from "dotenv";
import Teacher from "./models/Teacher";
import Batch from "./models/Batch";
import Course from "./models/Course";
import Room from "./models/Room";
import Institution from "./models/Institution";
import Department from "./models/Department";
import Timetable from "./models/Timetable";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/timetable-scheduler";

const COLLEGE_DATA = {
  "college_name": "Matrusri Engineering College",
  "code": "MEC-01",
  "last_updated_date": "2026-03-30",
  "departments": {
    "Information Technology": {
      "code": "IT",
      "classes": [
        {
          "semester": "B.E IV SEM",
          "section": "IT SEC-A",
          "room_number": "N 304",
          "class_teacher": "Ms. T. Vijaya Laxmi",
          "effective_from": "23/02/2026",
          "labs": ["JAVA LAB", "Microprocessor (MP) LAB", "Computer Networks (CN) LAB"],
          "schedule": {
            "MON": ["CN", "AT", "PS", "SS", "JAVA LAB(A)/MP LAB(B)"],
            "TUE": ["COMP", "JAVA", "CN LAB(A)/JAVA LAB(B)", "PS", "LIB"],
            "WED": ["AT", "PS", "SS", "CN", "JAVA", "COMP"],
            "THU": ["JAVA", "AT", "SS", "COMP", "EITK", "LIB"],
            "FRI": ["CN", "COMP", "AT", "JAVA", "SPORTS"],
            "SAT": ["MP LAB(A)/CN LAB(B)", "SS", "CN", "EITK", "SPORTS"]
          },
          "faculty_mapping": {
            "PS": "Dr. D. Purna Chandar Rao",
            "SS": "Mr. M. Thirupathi",
            "CN": "Mrs. Y. Sirisha",
            "JAVA": "Mrs. S. Ramya",
            "COMP": "Dr. K. Durga Prasad",
            "AT": "Mrs. K. Mounika",
            "EITK": "Mr. M. Suresh Kumar"
          }
        },
        {
          "semester": "B.E IV SEM",
          "section": "IT SEC-B",
          "room_number": "N 314",
          "class_teacher": "Mrs. K. Mounika",
          "effective_from": "23/02/2026",
          "labs": ["JAVA LAB", "Microprocessor (MP) LAB", "Computer Networks (CN) LAB"],
          "schedule": {
            "MON": ["JAVA", "COMP", "CN LAB(A)/JAVA LAB(B)", "PS", "CN"],
            "TUE": ["AT", "EITK", "COMP", "SS", "MP LAB(A)/CN LAB(B)"],
            "WED": ["CN", "JAVA", "PS", "SS", "AT", "LIB"],
            "THU": ["COMP", "SS", "JAVA", "AT", "CN", "LIB"],
            "FRI": ["AT", "JAVA", "CN", "SS", "PS", "SPORTS"],
            "SAT": ["EITK", "PS", "JAVA LAB(A)/MP LAB(B)", "COMP", "SPORTS"]
          },
          "faculty_mapping": {
            "PS": "Mr. G. Shankar",
            "SS": "Mrs. Narmada",
            "CN": "Mrs. Y. Sirisha",
            "JAVA": "Mrs. S. Ramya",
            "COMP": "Dr. K. Durga Prasad",
            "AT": "Mrs. K. Mounika",
            "EITK": "Mr. K.N. Balaji Rao"
          }
        },
        {
          "semester": "B.E VI SEM",
          "section": "IT SEC-A",
          "room_number": "N 305",
          "class_teacher": "Mr. A. Rajesh",
          "effective_from": "23/02/2026",
          "labs": ["ML LAB", "Embedded Systems (ES) LAB", "Mini Project-I LAB"],
          "schedule": {
            "MON": ["DM", "CC", "ML", "DAA", "ES", "LIB"],
            "TUE": ["CRT (All Day)"],
            "WED": ["ML LAB(A)/MINI PROJECT-I LAB(B)", "CC", "DAA", "NSC", "LIB"],
            "THU": ["ES", "DAA", "NSC", "LIB", "MINI PROJECT-I LAB(A)/ES LAB(B)"],
            "FRI": ["ML", "CC", "NSC", "DM", "ES LAB(A)/ML LAB(B)"],
            "SAT": ["DM", "ES", "ML", "LIB", "SPORTS"]
          },
          "faculty_mapping": {
            "ES": "Mr. A. Rajesh",
            "DAA": "Dr. J. Srinivas",
            "ML": "Mrs. T. Aruna Jyothi",
            "NSC": "Mrs. M. Srividya",
            "CC": "Mrs. S. Nagajyothi",
            "DM": "Ms. K. Smitha"
          }
        },
        {
          "semester": "B.E VI SEM",
          "section": "IT SEC-B",
          "room_number": "N 313",
          "class_teacher": "Mrs. S. Nagajyothi",
          "effective_from": "23/02/2026",
          "labs": ["ML LAB", "Embedded Systems (ES) LAB", "Mini Project-I LAB"],
          "schedule": {
            "MON": ["ML", "DAA", "NSC", "DM", "CC", "ES"],
            "TUE": ["CRT (All Day)"],
            "WED": ["CC", "DAA", "NSC", "ES", "ES LAB(A)/MINI PROJECT-I LAB(B)"],
            "THU": ["CC", "ML", "MINI PROJECT-I LAB(A)/ML LAB(B)", "DM", "LIB"],
            "FRI": ["ES", "DM", "ML LAB(A)/ES LAB(B)", "LIB", "SPORTS"],
            "SAT": ["ML", "DAA", "NSC", "LIB", "SPORTS"]
          },
          "faculty_mapping": {
            "ES": "Mr. A. Rajesh",
            "DAA": "Dr. J. Srinivas",
            "ML": "Mrs. T. Aruna Jyothi",
            "NSC": "Mrs. M. Srividya",
            "CC": "Mrs. S. Nagajyothi",
            "DM": "Dr. P. Bharath Kumar"
          }
        },
        {
          "semester": "B.E VIII SEM",
          "section": "IT",
          "room_number": "N 404",
          "class_teacher": "Mrs. S. Ramya",
          "effective_from": "09/02/2026",
          "labs": ["Project Work-II"],
          "schedule": {
            "MON": ["IS", "IS", "Project Work-II"],
            "TUE": ["ERSE", "IS", "Project Work-II"],
            "WED": ["Project Work-II", "ERSE", "ERSE", "Project Work-II"],
            "THU": ["Project Work-II", "LIB", "SPORTS"]
          },
          "faculty_mapping": {
            "IS": "Ms. T. Vijaya Laxmi",
            "ERSE": "Mrs. B. Prathyusha",
            "PW-II": ["Mrs. S. Nagajyothi", "Mrs. T. Aruna Jyothi"]
          }
        }
      ]
    },
    "Computer Engineering": {
      "code": "CME",
      "classes": [
        {
          "semester": "B.E IV SEM",
          "section": "CME",
          "room_number": "O 203",
          "class_teacher": "Dr. K. Durga Prasad",
          "effective_from": "23/02/2026",
          "labs": ["Operating Systems (OS) LAB", "JAVA LAB", "DBMS LAB"],
          "schedule": {
            "MON": ["SS", "SS", "EITK", "DBMS", "P&S", "LIB"],
            "TUE": ["P&S", "SS", "EITK", "OS", "LIB"],
            "WED": ["JAVA", "JAVA", "OS LAB(A)/JAVA LAB(B)", "DBMS", "LIB"],
            "THU": ["DBMS", "JAVA", "ETCE", "OS", "P&S", "SPORTS"],
            "FRI": ["JAVA LAB(A)/DBMS LAB(B)", "P&S", "ETCE", "DBMS", "OS"],
            "SAT": ["DBMS LAB(A)/OS LAB(B)", "SS", "JAVA", "SPORTS"]
          },
          "faculty_mapping": {
            "ETCE": "Mr. K. Prashanth",
            "P&S": "Ms. M. Swathi Devi",
            "SS": "Mrs. Narmada",
            "OS": "Dr. J. Srinivas",
            "JAVA": "Mr. K. Vikram Reddy",
            "DBMS": "Mrs. B. J. Praveena"
          }
        },
        {
          "semester": "B.E VI SEM",
          "section": "CME",
          "room_number": "O 204",
          "class_teacher": "Mrs. T. Aruna Jyothi",
          "effective_from": "23/02/2026",
          "labs": ["NLP LAB", "Web Technologies (WT) LAB", "Data Science (DS) LAB"],
          "schedule": {
            "MON": ["WT LAB(A)/NLP LAB(B)", "DM", "DS", "BCT", "LIB"],
            "TUE": ["IOT", "NLP", "CC", "BCT", "NLP LAB(A)/DS LAB(B)"],
            "WED": ["BCT", "DM", "NLP", "DS", "IOT", "LIB"],
            "THU": ["CRT (All Day)"],
            "FRI": ["NLP", "DM", "IOT", "CC", "SPORTS"],
            "SAT": ["DS LAB(A)/WT LAB(B)", "DS", "CC", "LIB", "SPORTS"]
          },
          "faculty_mapping": {
            "NLP": "Ms. J. Nagalaxmi",
            "IOT": "Ms. Mizna",
            "DS": "Ms. T. Vijaya Laxmi",
            "CC": "Mrs. S. Nagajyothi",
            "BCT": "Mrs. B. J. Praveena",
            "DM": "Ms. M. Pratibha"
          }
        },
        {
          "semester": "B.E VIII SEM",
          "section": "CME",
          "room_number": "O 202",
          "class_teacher": "Mr. K. Vikram Reddy",
          "effective_from": "09/02/2026",
          "labs": ["Project Work-II"],
          "schedule": {
            "MON": ["ERSE", "ERSE", "Project Work-II"],
            "TUE": ["ERSE", "CC", "Project Work-II"],
            "WED": ["Project Work-II", "CC", "CC", "Project Work-II"]
          },
          "faculty_mapping": {
            "CC": "Ms. Mizna",
            "ERSE": "Mr. T. Rajaramana",
            "PW-II": "Mrs. B. J. Praveena"
          }
        }
      ]
    }
  }
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Running comprehensive seed for Matrusri Engineering College...");

    // 1. Institution
    let institution = await Institution.findOneAndUpdate(
      { code: COLLEGE_DATA.code },
      { name: COLLEGE_DATA.college_name, address: "Saidabad, Hyderabad" },
      { upsert: true, new: true }
    );
    const instId = institution._id;
    console.log("✅ Institution synchronized");

    // 2. Departments
    const deptMap: Record<string, any> = {};
    for (const [name, data] of Object.entries(COLLEGE_DATA.departments)) {
      const dept = await Department.findOneAndUpdate(
        { code: (data as any).code, institutionId: instId },
        { name, institutionId: instId },
        { upsert: true, new: true }
      );
      deptMap[name] = dept;
    }
    console.log("✅ Departments synchronized");

    // 3. Rooms & Faculty (Collect all unique from classes)
    const uniqueRooms = new Set<string>();
    const facultyToSeed: Record<string, { name: string, dept: string }> = {};
    const subjectsToSeed: Record<string, { name: string, batchName: string, teachers: string[] }> = {};

    for (const departmentName of Object.keys(COLLEGE_DATA.departments)) {
      const deptData = COLLEGE_DATA.departments[departmentName as keyof typeof COLLEGE_DATA.departments];
      for (const cls of deptData.classes) {
        if (cls.room_number) uniqueRooms.add(cls.room_number);
        
        // Faculty from mappings
        for (const [abbr, facultyName] of Object.entries(cls.faculty_mapping)) {
          const names = Array.isArray(facultyName) ? facultyName : [facultyName];
          names.forEach(n => {
             facultyToSeed[n] = { name: n, dept: departmentName };
          });
          
          const uniqueBatchName = `${cls.section} ${cls.semester}`;
          subjectsToSeed[`${uniqueBatchName}-${abbr}`] = {
            name: abbr,
            batchName: uniqueBatchName,
            teachers: names
          };
        }
      }
    }

    // Upsert Rooms
    for (const roomName of Array.from(uniqueRooms)) {
      await Room.updateOne(
        { name: roomName, institutionId: instId },
        { $set: { capacity: 70, type: "lecture" } },
        { upsert: true }
      );
    }
    console.log(`✅ ${uniqueRooms.size} Rooms synchronized`);

    // Clean start for Teachers and secondary data for this institution
    await Teacher.deleteMany({ institutionId: instId });
    await Course.deleteMany({ institutionId: instId });
    await Batch.deleteMany({ institutionId: instId });

    // Upsert Teachers
    const teacherCodeMap: Record<string, string> = {};
    const usedCodes = new Set<string>();

    for (const [fName, fData] of Object.entries(facultyToSeed)) {
      // Improved code generation: Try to get 4 chars from last name, or first name
      let baseCode = fName.split('.').pop()?.trim().substring(0, 4).toUpperCase() || fName.substring(0, 4).toUpperCase();
      baseCode = baseCode.replace(/[^A-Z]/g, "X"); // Ensure A-Z
      
      let code = baseCode;
      let counter = 1;
      while (usedCodes.has(code)) {
        code = baseCode.substring(0, 3) + counter;
        counter++;
      }
      usedCodes.add(code);

      const teacher = await Teacher.create({
        name: fName,
        institutionId: instId,
        department: fData.dept,
        code: code,
        designation: "Assistant Professor"
      });
      teacherCodeMap[fName] = teacher.code;
    }
    console.log(`✅ ${Object.keys(facultyToSeed).length} Faculty members synchronized`);

    // Upsert Batches
    for (const departmentName of Object.keys(COLLEGE_DATA.departments)) {
      const deptData = COLLEGE_DATA.departments[departmentName as keyof typeof COLLEGE_DATA.departments];
      for (const cls of deptData.classes) {
        const uniqueBatchName = `${cls.section} ${cls.semester}`;
        await Batch.create({
          name: uniqueBatchName,
          institutionId: instId,
          semester: cls.semester.split(' ').pop() || "4",
          year: cls.semester.includes("IV") ? 2 : (cls.semester.includes("VI") ? 3 : 4),
          room: cls.room_number,
          classTeacher: cls.class_teacher,
          effectiveDate: cls.effective_from.split('/').reverse().join('-'), // DD/MM/YYYY to YYYY-MM-DD
        });
      }
    }
    console.log("✅ Batches synchronized");

    // Upsert Courses
    const courseCodeLookup: Record<string, string> = {};
    for (const [key, sData] of Object.entries(subjectsToSeed)) {
      const isLab = sData.name.toLowerCase().includes("lab") || sData.name.includes("PROJECT");
      const teacherCodes = sData.teachers.map(n => teacherCodeMap[n]);
      const uniqueCode = `${sData.name}-${sData.batchName}`;
      courseCodeLookup[key] = uniqueCode;

      await Course.create({
        code: uniqueCode,
        name: sData.name,
        batch: sData.batchName,
        institutionId: instId,
        type: isLab ? "lab" : "lecture",
        teacherCodes: teacherCodes,
        sessionsPerWeek: isLab ? 1 : 3,
        durationSlots: isLab ? 2 : 1,
        preferredRoomTypes: [isLab ? "lab" : "lecture"],
      });
    }
    console.log("✅ Courses synchronized");

    // 4. Construct Timetable Grid
    const timetablesByBatch: Record<string, any> = {};
    const dayList = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

    for (const departmentName of Object.keys(COLLEGE_DATA.departments)) {
      const deptData = COLLEGE_DATA.departments[departmentName as keyof typeof COLLEGE_DATA.departments];
      for (const cls of deptData.classes) {
        const uniqueBatchName = `${cls.section} ${cls.semester}`;
        const schedule: Record<string, (any | null)[]> = {
          "MON": Array(7).fill(null),
          "TUE": Array(7).fill(null),
          "WED": Array(7).fill(null),
          "THU": Array(7).fill(null),
          "FRI": Array(7).fill(null),
          "SAT": Array(7).fill(null),
        };

        for (const day of dayList) {
          const jsonDaySchedule = (cls.schedule as any)[day] || [];
          
          if (jsonDaySchedule[0] === "CRT (All Day)") {
            for (let i = 0; i < 7; i++) {
              if (i === 4) schedule[day][i] = "LUNCH";
              else schedule[day][i] = { subject: "CRT", room: cls.room_number, span: 1 };
            }
            continue;
          }

          let pIdx = 0;
          for (const item of jsonDaySchedule) {
            if (pIdx === 4) pIdx++; // Skip lunch
            if (pIdx >= 7) break;

            const isDouble = item.includes("LAB") || item.includes("PROJECT");
            const lookupKey = `${uniqueBatchName}-${item}`;
            const finalCode = courseCodeLookup[lookupKey] || item;

            schedule[day][pIdx] = { 
              subject: finalCode, 
              room: isDouble ? "LAB" : cls.room_number, 
              span: 1 
            };
            pIdx++;
          }
          schedule[day][4] = "LUNCH";
        }

        const faculty_mapping: any[] = [];
        for (const [abbr, facultyName] of Object.entries(cls.faculty_mapping)) {
          const lookupKey = `${uniqueBatchName}-${abbr}`;
          const finalCode = courseCodeLookup[lookupKey] || abbr;

          faculty_mapping.push({
            code: finalCode,
            subject: abbr,
            abbr: abbr,
            faculty: Array.isArray(facultyName) ? facultyName.join(", ") : facultyName
          });
        }

        timetablesByBatch[uniqueBatchName] = {
          id: uniqueBatchName.toLowerCase().replace(/\s+/g, "-"),
          class: uniqueBatchName,
          room: cls.room_number,
          date: new Date().toLocaleDateString("en-GB"),
          wef: cls.effective_from,
          classTeacher: cls.class_teacher,
          schedule: schedule,
          faculty_mapping: faculty_mapping
        };
      }
    }

    // 5. Save the Timetable
    await Timetable.deleteMany({ institutionId: instId }); // Clean slate for this institution
    const finalTimetable = new Timetable({
      courses: await Course.find({ institutionId: instId }),
      teachers: await Teacher.find({ institutionId: instId }),
      rooms: await Room.find({ institutionId: instId }),
      grid: timetablesByBatch,
      metrics: { conflicts: 0, gapScore: 100, balanceScore: 100, softScore: 100 },
      workload: [],
      institutionId: instId
    });

    await finalTimetable.save();
    console.log("✅ Timetable Grid synchronized");

    console.log("\n🚀 SEEDING COMPLETE!");
    console.log("Please restart your server and select 'Matrusri Engineering College' in the app.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
