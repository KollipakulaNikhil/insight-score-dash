import type { Student, PlacementDrive, LmsSubject, LmsUnit } from "./types";

// All data below is fictional demo data for the HacXLerate prototype.

const TOPICS = ["Foundations", "Core Concepts", "Applied Methods", "Advanced Topics", "Case Studies", "Revision & Assessment"];

function makeUnits(subject: string, completedUnits: number, seedOffset: number): LmsUnit[] {
  return TOPICS.map((title, i) => {
    const done = i < completedUnits;
    return {
      unit: i + 1,
      title: `${subject}: ${title}`,
      lessons: [1, 2, 3].map((n) => ({
        title: `Lesson ${i + 1}.${n}`,
        completed: done || (i === completedUnits && n === 1 && seedOffset % 2 === 0),
        resource: `Sample resource: ${subject} notes pack ${i + 1}.${n} (demo)`,
      })),
      assignment: {
        title: `Assignment ${i + 1}: ${title}`,
        deadline: `2026-0${Math.min(9, 3 + i)}-1${(i + seedOffset) % 9}`,
        submitted: done,
        marks: done ? 14 + ((i * 7 + seedOffset) % 7) : null,
      },
    };
  });
}

function lms(subjects: string[], completion: number[], offset: number): LmsSubject[] {
  return subjects.map((s, i) => ({ subject: s, units: makeUnits(s, completion[i] ?? 0, offset + i) }));
}

const SUBJ = ["Data Structures", "DBMS", "Operating Systems", "Computer Networks"];

function subj(marks: number[], held: number[], att: number[]) {
  return SUBJ.map((s, i) => ({ subject: s, marks: marks[i], classesHeld: held[i], classesAttended: att[i] }));
}

export const SEED_STUDENTS: Student[] = [
  {
    id: "BIB-2026-001", name: "Aarav Sharma", branch: "CSE", semester: 6, gradYear: 2027, mentorId: "FAC-01",
    cgpa: 8.6, semesterGrades: [8.2, 8.4, 8.7, 8.6, 8.8], backlogs: 0,
    subjects: subj([88, 82, 79, 85], [42, 40, 38, 41], [39, 37, 35, 38]),
    lms: lms(SUBJ, [6, 6, 5, 6], 1),
    skills: { coding: 88, aptitude: 76, analytical: 82, verbal: 70, communication: 74 },
    engagement: [
      { type: "hackathon", name: "HacXLerate 2025", date: "2025-11-14", verified: true, evidence: "Certificate #HX-221" },
      { type: "club", name: "Coding Club — core member", date: "2025-08-01", verified: true },
      { type: "certification", name: "AWS Cloud Practitioner (sample)", date: "2026-01-20", verified: true, evidence: "Verification link on file" },
    ],
    resumeCompleteness: 92, targetRoles: ["SDE", "Data Analyst"], assessmentsCompleted: 3, assessmentsRequired: 3,
    facultyFeedback: [{ from: "Dr. Rao", note: "Consistent and curious; strong project work.", date: "2026-02-10" }],
    studentFeedback: [{ about: "DBMS", note: "Requests more hands-on labs.", date: "2026-02-05" }],
  },
  {
    id: "BIB-2026-002", name: "Priya Nair", branch: "CSE", semester: 6, gradYear: 2027, mentorId: "FAC-01",
    cgpa: 8.9, semesterGrades: [8.7, 8.8, 9.0, 8.9, 9.1], backlogs: 0,
    subjects: subj([91, 89, 86, 90], [42, 40, 38, 41], [34, 30, 28, 31]), // poor attendance
    lms: lms(SUBJ, [6, 5, 5, 6], 2),
    skills: { coding: 84, aptitude: 81, analytical: 85, verbal: 78, communication: 80 },
    engagement: [{ type: "event", name: "Tech Fest volunteer", date: "2025-10-02", verified: true }],
    resumeCompleteness: 68, targetRoles: ["SDE"], assessmentsCompleted: 1, assessmentsRequired: 3,
    facultyFeedback: [{ from: "Dr. Rao", note: "Excellent academics; attendance needs attention.", date: "2026-02-12" }],
    studentFeedback: [],
  },
  {
    id: "BIB-2026-003", name: "Rohan Verma", branch: "ECE", semester: 6, gradYear: 2027, mentorId: "FAC-01",
    cgpa: 6.4, semesterGrades: [7.8, 7.4, 6.9, 6.4, 6.1], backlogs: 2,
    subjects: subj([64, 58, 61, 66], [42, 40, 38, 41], [39, 38, 36, 39]), // high attendance, declining
    lms: lms(SUBJ, [4, 3, 4, 3], 3),
    skills: { coding: 62, aptitude: 58, analytical: 60, verbal: 66, communication: 70 },
    engagement: [{ type: "club", name: "Robotics Club", date: "2025-09-10", verified: true }],
    resumeCompleteness: 55, targetRoles: ["Embedded Engineer"], assessmentsCompleted: 1, assessmentsRequired: 3,
    facultyFeedback: [{ from: "Prof. Iyer", note: "Regular in class but struggling with fundamentals since sem 3.", date: "2026-01-28" }],
    studentFeedback: [{ about: "Operating Systems", note: "Pace feels too fast.", date: "2026-02-01" }],
  },
  {
    id: "BIB-2026-004", name: "Sneha Kulkarni", branch: "CSE", semester: 6, gradYear: 2027, mentorId: "FAC-02",
    cgpa: 7.8, semesterGrades: [7.5, 7.7, 7.8, 7.9, 7.8], backlogs: 0,
    subjects: subj([78, 81, 76, 80], [42, 40, 38, 41], [36, 35, 33, 36]),
    lms: lms(SUBJ, [2, 3, 2, 3], 4), // incomplete LMS
    skills: { coding: 86, aptitude: 48, analytical: 71, verbal: 64, communication: 62 }, // strong coding weak aptitude
    engagement: [
      { type: "hackathon", name: "Smart India Hackathon (demo entry)", date: "2025-12-10", verified: true },
      { type: "certification", name: "Claimed: ML Specialization", date: "2026-01-15", verified: false },
    ],
    resumeCompleteness: 74, targetRoles: ["SDE", "ML Engineer"], assessmentsCompleted: 2, assessmentsRequired: 3,
    facultyFeedback: [],
    studentFeedback: [],
  },
  {
    id: "BIB-2026-005", name: "Arjun Mehta", branch: "IT", semester: 6, gradYear: 2027, mentorId: "FAC-02",
    cgpa: 5.2, semesterGrades: [6.0, 5.8, 5.5, 5.2, 5.0], backlogs: 3,
    subjects: subj([52, 48, 55, 50], [42, 40, 38, 41], [26, 24, 22, 25]),
    lms: lms(SUBJ, [1, 2, 1, 2], 5),
    skills: { coding: 45, aptitude: 40, analytical: 48, verbal: 55, communication: 58 },
    engagement: [],
    resumeCompleteness: 30, targetRoles: [], assessmentsCompleted: 0, assessmentsRequired: 3,
    facultyFeedback: [{ from: "Prof. Iyer", note: "Multiple risk indicators; recommend structured mentoring plan.", date: "2026-02-15" }],
    studentFeedback: [],
  },
  {
    id: "BIB-2026-006", name: "Ishita Reddy", branch: "ECE", semester: 4, gradYear: 2028, mentorId: "FAC-02",
    cgpa: 8.1, semesterGrades: [7.9, 8.0, 8.2], backlogs: 0,
    subjects: subj([84, 80, 82, 83], [40, 38, 36, 39], [37, 35, 34, 36]),
    lms: lms(SUBJ, [5, 5, 6, 5], 6),
    skills: { coding: 74, aptitude: 79, analytical: 80, verbal: 83, communication: 85 },
    engagement: [
      { type: "club", name: "Literary Society", date: "2025-08-20", verified: true },
      { type: "event", name: "National Debate (demo)", date: "2025-11-05", verified: true },
    ],
    resumeCompleteness: 60, targetRoles: ["Business Analyst"], assessmentsCompleted: 1, assessmentsRequired: 2,
    facultyFeedback: [],
    studentFeedback: [{ about: "Computer Networks", note: "Enjoys the lab sessions.", date: "2026-01-20" }],
  },
  {
    id: "BIB-2026-007", name: "Karan Patel", branch: "ME", semester: 6, gradYear: 2027, mentorId: "FAC-01",
    cgpa: 7.1, semesterGrades: [7.0, 7.2, 7.1, 7.0, 7.2], backlogs: 1,
    subjects: subj([70, 72, 68, 74], [42, 40, 38, 41], [32, 30, 29, 31]),
    lms: lms(SUBJ, [3, 4, 3, 4], 7),
    skills: { coding: 55, aptitude: 66, analytical: 70, verbal: 60, communication: 63 },
    engagement: [{ type: "event", name: "Sponsor Expo helper", date: "2025-10-12", verified: false }],
    resumeCompleteness: 58, targetRoles: ["Design Engineer"], assessmentsCompleted: 1, assessmentsRequired: 3,
    facultyFeedback: [],
    studentFeedback: [],
  },
  {
    id: "BIB-2026-008", name: "Meera Joshi", branch: "CSE", semester: 4, gradYear: 2028, mentorId: "FAC-02",
    cgpa: 9.2, semesterGrades: [9.0, 9.1, 9.3], backlogs: 0,
    subjects: subj([93, 95, 90, 92], [40, 38, 36, 39], [38, 36, 34, 37]),
    lms: lms(SUBJ, [6, 6, 6, 6], 8),
    skills: { coding: 90, aptitude: 88, analytical: 91, verbal: 76, communication: 72 },
    engagement: [
      { type: "hackathon", name: "HacXLerate 2025 — winner (demo)", date: "2025-11-14", verified: true, evidence: "Winner certificate" },
      { type: "certification", name: "Google Data Analytics (sample)", date: "2026-02-01", verified: true },
    ],
    resumeCompleteness: 85, targetRoles: ["SDE", "Data Scientist"], assessmentsCompleted: 2, assessmentsRequired: 2,
    facultyFeedback: [{ from: "Dr. Rao", note: "Top of cohort; encourage research exposure.", date: "2026-02-18" }],
    studentFeedback: [],
  },
];

export const SEED_DRIVES: PlacementDrive[] = [
  { id: "DRV-01", company: "TechNova (fictional)", role: "SDE", minCgpa: 7.5, maxBacklogs: 0, branches: ["CSE", "IT"], gradYear: 2027, requiresAssessment: true },
  { id: "DRV-02", company: "DataCraft (fictional)", role: "Data Analyst", minCgpa: 7.0, maxBacklogs: 1, branches: ["CSE", "IT", "ECE"], gradYear: 2027, requiresAssessment: true },
  { id: "DRV-03", company: "EmbedWorks (fictional)", role: "Embedded Engineer", minCgpa: 6.5, maxBacklogs: 2, branches: ["ECE"], gradYear: 2027, requiresAssessment: false },
  { id: "DRV-04", company: "CoreMech (fictional)", role: "Design Engineer", minCgpa: 6.0, maxBacklogs: 2, branches: ["ME"], gradYear: 2027, requiresAssessment: false },
];

export const MENTORS = [
  { id: "FAC-01", name: "Dr. Rao" },
  { id: "FAC-02", name: "Prof. Iyer" },
];

export const SAMPLE_CSV = `student_id,name,branch,semester,grad_year,cgpa,backlogs,attendance_pct,coding,aptitude,analytical,verbal,communication,resume_completeness
BIB-2026-009,Nikhil Rao,CSE,6,2027,7.4,0,82,70,65,68,72,71,66
BIB-2026-010,Divya Menon,IT,4,2028,8.3,0,91,78,80,82,75,77,70
BIB-2026-009,Duplicate Row,CSE,6,2027,7.4,0,82,70,65,68,72,71,66
BIB-2026-011,,ECE,6,2027,6.8,1,77,60,58,62,66,64,50`;
