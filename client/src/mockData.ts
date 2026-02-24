// Mock data based on real timetable images

export const timeSlots = [
  { name: "Period 1", startTime: "09:40", endTime: "10:40" },
  { name: "Period 2", startTime: "10:40", endTime: "11:40" },
  { name: "Period 3", startTime: "11:40", endTime: "12:40" },
  { name: "Period 4", startTime: "12:40", endTime: "13:40" },
  { name: "Lunch", startTime: "13:40", endTime: "14:10" },
  { name: "Period 5", startTime: "14:10", endTime: "15:10" },
  { name: "Period 6", startTime: "15:10", endTime: "16:10" },
];

export const subjects = {
  // III SEM - IT
  ETCE: { name: "Effective Technical Communication in English", faculty: "DR CH RAJINI PRASHANTH" },
  FA: { name: "Finance and Accounting", faculty: "New Faculty A" },
  BE: { name: "Basic Electronics", faculty: "DR K KOTESWARA RAO" },
  DE: { name: "Digital Electronics", faculty: "DR N SHIRIRALA" },
  DBS: { name: "Database Systems", faculty: "MRS T. SIRISHA" },
  PP: { name: "Python Programming", faculty: "MS T. VIJAYA LAXMI" },
  DM: { name: "Discrete Mathematics", faculty: "MRS STVSAV RAMYA" },
  CRT: { name: "Critical Thinking", faculty: "MRS K. MOUNIKA" },
  "BE LAB": { name: "Basic Electronics Lab", faculty: "DR K KOTESWARA RAO/MRS J SHAILAJA" },
  "PP LAB": { name: "Python Programming Lab", faculty: "MS T. VIJAYA LAXMI/MRS M. SRIVIDYA" },
  "DBS LAB": { name: "Database Systems Lab", faculty: "MRS Y. SIRISHA/MR A. RAJESH/MS J. NAGALAXMI" },
  
  // V SEM - IT
  PPL: { name: "Principles of Programming Languages", faculty: "MR V. GOPINATH" },
  AI: { name: "Artificial Intelligence", faculty: "DR J. SRINIVAS" },
  OS: { name: "Operating Systems", faculty: "MR A. RAJESH" },
  SE: { name: "Software Engineering", faculty: "DR K. DURGA PRASAD" },
  FSD: { name: "Full Stack Development", faculty: "MS T. VIJAYALAXMI" },
  OOAD: { name: "Object Oriented Analysis and Design", faculty: "MRS S. SIRISHA" },
  "AI LAB": { name: "Artificial Intelligence Lab", faculty: "MRS M. SRIVIDYA" },
  "OS LAB": { name: "Operating System Lab", faculty: "MR A. RAJESH/DR K. DURGA PRASAD" },
  "FSD LAB": { name: "Full Stack Development Lab", faculty: "MS T. VIJAYALAXMI/MS J. NAGALAXMI" },
  
  // VII SEM - IT
  IOT: { name: "Internet of Things", faculty: "MR V. GOPINATH" },
  BDA: { name: "Big Data Analytics", faculty: "MRS Y. SIRISHA" },
  ENT: { name: "Entrepreneurship", faculty: "DR M. KRISHNA" },
  NLP: { name: "Natural Language Processing", faculty: "MRS M. SRIVIDYA" },
  SPM: { name: "Software Project Management", faculty: "MS J. NAGALAXMI" },
  "IOT LAB": { name: "Internet of Things Lab", faculty: "MR V. GOPINATH" },
  "PW-I": { name: "Project Work-I", faculty: "MRS S. NAGAJYOTHI/MRS T. ARUNA JYOTHI" },
  
  // Common
  LIB: { name: "Library", faculty: "-" },
  SPORTS: { name: "Sports", faculty: "-" },
};

export const timetables = [
  {
    id: "be3-it-a",
    class: "B.E III SEM - IT SEC-A",
    room: "N 304",
    date: "29-07-2025",
    wef: "22/09/2025",
    classTeacher: "MS. T. VIJAYA LAXMI",
    schedule: {
      MON: ["PP", "DBS", "FA", "BE", null, "DM", "LIB"],
      TUE: ["BE", "FA", "ETCE", "PP", null, "CRT", "DE"],
      WED: ["PP", "DBS", { subject: "BE LAB/PP LAB/DBS LAB", span: 2 }, null, "FA", "SPORTS"],
      THU: ["CRT", "FA", "DM", "DE", null, "DBS", "LIB"],
      FRI: ["DE", "DM", "BE", "DBS", null, { subject: "BE LAB/PP LAB/DBS LAB", span: 2 }],
      SAT: ["PP", "ETCE", { subject: "BE LAB/PP LAB/DBS LAB", span: 2 }, null, "DM", "SPORTS"],
    },
  },
  {
    id: "be3-it-b",
    class: "B.E III SEM - IT SEC-B",
    room: "N 314",
    date: "29-08-2025",
    wef: "22/09/2025",
    classTeacher: "MRS. K. MOUNIKA",
    schedule: {
      MON: ["CRT", "ETCE", { subject: "BE LAB/PP LAB/DBS LAB", span: 2 }, null, "PP", "LIB"],
      TUE: ["DBS", "PP", "FA", "DM", null, "BE", "SPORTS"],
      WED: ["DM", "DBS", "PP", "BE", null, "DE", "LIB"],
      THU: ["FA", "DBS", "DE", "LIB", null, { subject: "BE LAB/PP LAB/DBS LAB", span: 2 }],
      FRI: ["DE", "DBS", "BE", "FA", null, "CRT", "DM"],
      SAT: [{ subject: "BE LAB/PP LAB/DBS LAB", span: 2 }, "ETCE", "PP", null, "DM", "SPORTS"],
    },
  },
  {
    id: "be7-it",
    class: "B.E VII SEM - IT",
    room: "",
    date: "29-08-2025",
    wef: "02/09/2025",
    classTeacher: "MRS. STVSAV RAMYA",
    schedule: {
      MON: ["SPM", "NLP", "ENT", "BDA", null, { subject: "PW-I", span: 2 }],
      TUE: ["IOT", "BDA", { subject: "IOT LAB/PW-I", span: 2 }, null, "ENT", "LIB"],
      WED: [{ subject: "IOT LAB/PW-I", span: 2 }, "SPM", "NLP", null, "LIB", null],
      THU: ["SPM", "IOT", { subject: "PW-I", span: 2 }, null, "SPORTS", null],
      FRI: ["BDA", "IOT", "NLP", "ENT", null, "SPORTS", null],
      SAT: [],
    },
  },
  {
    id: "be5-it-b",
    class: "B.E V SEM - IT SEC-B",
    room: "N 313",
    date: "29-08-2025",
    wef: "22/09/2025",
    classTeacher: "MRS. S. NAGAJYOTHI",
    schedule: {
      MON: [{ subject: "AI LAB/OS LAB/FSD LAB", span: 2 }, "OS", "SE", null, "LIB", null],
      TUE: ["OS", "AI", "OOAD", "SE", null, { subject: "AI LAB/OS LAB/FSD LAB", span: 2 }],
      WED: ["AI", "CRT", "OOAD", "FSD", null, "PPL", "LIB"],
      THU: [null, "CRT", "FSD", "PPL", null, "SPORTS", null],
      FRI: ["AI", "SE", { subject: "AI LAB/OS LAB/FSD LAB", span: 2 }, null, "CRT", "LIB"],
      SAT: ["OOAD", "OS", "PPL", "FSD", null, "SPORTS", null],
    },
  },
  {
    id: "be5-it-a",
    class: "B.E V SEM - IT SEC-A",
    room: "N 305",
    date: "29-08-2025",
    wef: "22/09/2025",
    classTeacher: "MR. A. RAJESH",
    schedule: {
      MON: ["OOAD", "CRT", "SE", "PPL", null, "OS", "LIB"],
      TUE: [{ subject: "AI LAB/OS LAB/FSD LAB", span: 2 }, "CRT", "AI", null, "FSD", "SPORTS"],
      WED: ["CRT", null, "SE", "PPL", null, { subject: "AI LAB/OS LAB/FSD LAB", span: 2 }],
      THU: [{ subject: "AI LAB/OS LAB/FSD LAB", span: 2 }, "OOAD", "FSD", null, "LIB", null],
      FRI: ["OS", "OOAD", "FSD", "AI", null, "LIB", null],
      SAT: ["AI", "OS", "PPL", "SE", null, "SPORTS", null],
    },
  },
];
