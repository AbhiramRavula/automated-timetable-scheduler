# Sample Data from Real Timetables

## Analysis of Provided Timetables

### Common Structure:
- **Time Slots**: 7 periods per day
  - Period 1: 9:40am - 10:40am
  - Period 2: 10:40am - 11:40am
  - Period 3: 11:40am - 12:40pm
  - Period 4: 12:40pm - 1:40pm
  - Lunch: 1:40pm - 2:10pm
  - Period 5: 2:10pm - 3:10pm
  - Period 6: 3:10pm - 4:10pm

- **Working Days**: Monday - Saturday (6 days)

### Classes Observed:
1. B.E III SEM - IT SEC-A (Room N 304)
2. B.E III SEM - IT SEC-B (Room N 314)
3. B.E VII SEM - IT (No specific room)
4. B.E V SEM - IT SEC-B (Room N 313)
5. B.E V SEM - IT SEC-A (Room N 305)

### Subject Types:
- **Theory Subjects**: 1 hour sessions
- **Lab Subjects**: 2-3 hour sessions (multiple consecutive periods)
- **Sports**: Usually afternoon slots
- **Library (LIB)**: 1 hour sessions

### Key Features:
1. Labs span multiple periods (shown as merged cells)
2. Same subject can have both theory and lab components
3. Multiple faculty can teach same lab
4. Lunch break is consistent across all timetables
5. Sports typically scheduled 2-3 times per week
6. Library sessions scheduled regularly

### Sample Subjects (III SEM - IT):
- ETCE: Effective Technical Communication in English
- FA: Finance and Accounting
- BE: Basic Electronics
- DE: Digital Electronics
- DBS: Database Systems
- PP: Python Programming
- DM: Discrete Mathematics
- CRT: Critical Thinking
- BE LAB, PP LAB, DBS LAB (with multiple periods)

### Sample Subjects (V SEM - IT):
- PPL: Principles of Programming Languages
- AI: Artificial Intelligence
- OS: Operating Systems
- SE: Software Engineering
- FSD: Full Stack Development
- OOAD: Object Oriented Analysis and Design
- AI LAB, OS LAB, FSD LAB

### Sample Subjects (VII SEM - IT):
- IOT: Internet of Things
- BDA: Big Data Analytics
- ENT: Entrepreneurship
- NLP: Natural Language Processing
- SPM: Software Project Management
- PW-I: Project Work-I
- IOT LAB

## Implementation Requirements:

### 1. Generate All Timetables at Once
- System should generate timetables for all sections/years simultaneously
- Ensure no teacher conflicts across sections
- Ensure no room conflicts

### 2. Editable/Mutable Timetables
- Allow drag-and-drop to move sessions
- Allow manual editing of any cell
- Real-time conflict detection
- Validation on every change

### 3. Display Format
- Match the exact format from images
- Show merged cells for multi-period labs
- Include subject legend below grid
- Show all metadata (class, room, teacher, date)

### 4. Export Format
- PDF matching the image format exactly
- Print-friendly layout
- Include all metadata and legends
