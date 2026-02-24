# Models Specification

## Teacher
- name: string
- code: string (unique)
- availability: array of { day: number, slot: number } or boolean matrix
- maxLoadPerDay: number

## Room
- name: string (unique)
- capacity: number
- type: "lecture" | "lab" | "seminar"
- allowedDays: number[]
- allowedSlots: number[]

## Course
- code: string (unique)
- name: string
- type: "lecture" | "lab"
- durationSlots: number
- preferredRooms: string[] (room names or IDs)
- preferredSlots: number[] (slot indices)
- teacherCode: string
- batch: string

## Timetable
- courses: Course[]
- teachers: Teacher[]
- rooms: Room[]
- grid: any  // placeholder: 3D day x slot x room index → courseCode
- constraintsSnapshot: any
- metrics:
  - conflicts: number
  - gapScore: number
  - balanceScore: number
  - softScore: number
- createdAt: Date
