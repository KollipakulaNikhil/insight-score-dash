export interface SubjectMark {
  subject: string;
  marks: number; // 0-100
  classesHeld: number;
  classesAttended: number;
}

export interface LmsUnit {
  unit: number;
  title: string;
  lessons: { title: string; completed: boolean; resource: string }[];
  assignment: { title: string; deadline: string; submitted: boolean; marks: number | null };
}

export interface LmsSubject {
  subject: string;
  units: LmsUnit[];
}

export interface Skills {
  coding: number;
  aptitude: number;
  analytical: number;
  verbal: number;
  communication: number;
}

export interface EngagementItem {
  type: "event" | "club" | "hackathon" | "certification";
  name: string;
  date: string;
  verified: boolean;
  evidence?: string;
}

export interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  minCgpa: number;
  maxBacklogs: number;
  branches: string[];
  gradYear: number;
  requiresAssessment: boolean;
}

export interface Student {
  id: string; // unique student ID, e.g. BIB-2026-001
  name: string;
  branch: string;
  semester: number;
  gradYear: number;
  mentorId: string;
  cgpa: number;
  semesterGrades: number[]; // SGPA history
  backlogs: number;
  subjects: SubjectMark[];
  lms: LmsSubject[];
  skills: Skills;
  engagement: EngagementItem[];
  resumeCompleteness: number; // 0-100, -1 = missing
  mockInterviews?: number; // count, -1/undefined = missing
  targetRoles: string[];
  assessmentsCompleted: number;
  assessmentsRequired: number;
  facultyFeedback: { from: string; note: string; date: string }[];
  studentFeedback: { about: string; note: string; date: string }[];
}

export interface Intervention {
  id: string;
  studentId: string;
  reason: string;
  action: string;
  priority: "low" | "medium" | "high";
  owner: string;
  followUpDate: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
}

export interface Complaint {
  id: string;
  from: string;
  text: string;
  date: string;
  reviewed: boolean;
  reviewedBy?: string;
}

export interface ScoreWeights {
  academics: number;
  attendance: number;
  lms: number;
  engagement: number;
  skills: number;
  placement: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  academics: 30,
  attendance: 20,
  lms: 15,
  engagement: 10,
  skills: 10,
  placement: 15,
};

export type RiskBand = "On Track" | "Monitor" | "Needs Attention" | "High Priority";

export function riskBand(score: number): RiskBand {
  if (score >= 80) return "On Track";
  if (score >= 65) return "Monitor";
  if (score >= 50) return "Needs Attention";
  return "High Priority";
}
