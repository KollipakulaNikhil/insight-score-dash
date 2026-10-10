import type { Student } from "./types";
import { studentAttendancePct, lmsCompletion, componentScores } from "./scoring";

/**
 * Points-based risk flags. All rules live in this one config file:
 * each signal has a threshold and a point weight; triggered signals
 * add points and become drivers. Missing inputs add no points and
 * are reported as "Insufficient data" instead.
 */

export type FlagLevel = "Low" | "Medium" | "High";

export interface RiskSignal {
  id: string;
  label: string;
  threshold: string; // human-readable, shown in the driver list
  points: number;
  /** Return the observed value when the signal fires, null when data is missing, false when it does not fire. */
  evaluate: (s: Student) => { fired: boolean; value: string } | null;
}

export interface FlagDriver {
  signal: string;
  value: string;
  threshold: string;
  points: number;
}

export interface RiskFlagResult {
  level: FlagLevel;
  points: number;
  drivers: FlagDriver[]; // sorted by points desc
  insufficient: string[]; // signals with missing data
}

// ---------- Academic Risk signals ----------
export const ACADEMIC_SIGNALS: RiskSignal[] = [
  {
    id: "low-cgpa",
    label: "CGPA below 6.5",
    threshold: "CGPA < 6.5",
    points: 30,
    evaluate: (s) => (s.cgpa > 0 ? { fired: s.cgpa < 6.5, value: s.cgpa.toFixed(2) } : null),
  },
  {
    id: "low-attendance",
    label: "Attendance below 75%",
    threshold: "Attendance < 75%",
    points: 25,
    evaluate: (s) => {
      const a = studentAttendancePct(s);
      return a === null ? null : { fired: a < 75, value: a.toFixed(1) + "%" };
    },
  },
  {
    id: "backlogs",
    label: "Active backlogs",
    threshold: "Backlogs ≥ 1",
    points: 20,
    evaluate: (s) => ({ fired: s.backlogs >= 1, value: String(s.backlogs) }),
  },
  {
    id: "declining-grades",
    label: "Declining SGPA trend",
    threshold: "Latest SGPA drop ≥ 0.5 from first",
    points: 15,
    evaluate: (s) => {
      if (s.semesterGrades.length < 2) return null;
      const first = s.semesterGrades[0] ?? 0;
      const last = s.semesterGrades.at(-1) ?? 0;
      return { fired: last < first - 0.5, value: `${first.toFixed(1)} → ${last.toFixed(1)}` };
    },
  },
  {
    id: "low-lms",
    label: "LMS completion below 60%",
    threshold: "LMS < 60%",
    points: 10,
    evaluate: (s) => {
      const l = lmsCompletion(s);
      return l === null ? null : { fired: l < 60, value: l.toFixed(0) + "%" };
    },
  },
];

// ---------- Placement Risk signals ----------
export const PLACEMENT_SIGNALS: RiskSignal[] = [
  {
    id: "low-readiness",
    label: "Placement readiness below 55%",
    threshold: "Readiness < 55%",
    points: 30,
    evaluate: (s) => {
      const p = componentScores(s).placement;
      return p === null ? null : { fired: p < 55, value: p.toFixed(0) + "%" };
    },
  },
  {
    id: "weak-resume",
    label: "Resume below 70% complete",
    threshold: "Resume < 70%",
    points: 20,
    evaluate: (s) =>
      s.resumeCompleteness >= 0
        ? { fired: s.resumeCompleteness < 70, value: s.resumeCompleteness + "%" }
        : null,
  },
  {
    id: "pending-assessments",
    label: "Placement assessments pending",
    threshold: "Completed < required",
    points: 20,
    evaluate: (s) =>
      s.assessmentsRequired > 0
        ? { fired: s.assessmentsCompleted < s.assessmentsRequired, value: `${s.assessmentsCompleted}/${s.assessmentsRequired}` }
        : null,
  },
  {
    id: "weak-aptitude",
    label: "Aptitude score below 55",
    threshold: "Aptitude < 55",
    points: 15,
    evaluate: (s) => (s.skills.aptitude >= 0 ? { fired: s.skills.aptitude < 55, value: String(s.skills.aptitude) } : null),
  },
  {
    id: "weak-communication",
    label: "Communication score below 55",
    threshold: "Communication < 55",
    points: 15,
    evaluate: (s) =>
      s.skills.communication >= 0 ? { fired: s.skills.communication < 55, value: String(s.skills.communication) } : null,
  },
];

/** Level thresholds: total points → Low / Medium / High */
export const FLAG_LEVELS: { min: number; level: FlagLevel }[] = [
  { min: 40, level: "High" },
  { min: 20, level: "Medium" },
  { min: 0, level: "Low" },
];

export function computeFlag(s: Student, signals: RiskSignal[]): RiskFlagResult {
  const drivers: FlagDriver[] = [];
  const insufficient: string[] = [];
  let points = 0;
  for (const sig of signals) {
    const r = sig.evaluate(s);
    if (r === null) {
      insufficient.push(sig.label);
      continue;
    }
    if (r.fired) {
      points += sig.points;
      drivers.push({ signal: sig.label, value: r.value, threshold: sig.threshold, points: sig.points });
    }
  }
  drivers.sort((a, b) => b.points - a.points);
  const level = FLAG_LEVELS.find((l) => points >= l.min)!.level;
  return { level, points, drivers, insufficient };
}

export function academicRisk(s: Student): RiskFlagResult {
  return computeFlag(s, ACADEMIC_SIGNALS);
}

export function placementRisk(s: Student): RiskFlagResult {
  return computeFlag(s, PLACEMENT_SIGNALS);
}

/** Overall band rule: any High flag means the band cannot be On Track. */
export function effectiveBand(score: number | null, baseBand: string | null, academic: RiskFlagResult, placement: RiskFlagResult): string | null {
  if (score === null || baseBand === null) return baseBand;
  if (baseBand === "On Track" && (academic.level === "High" || placement.level === "High")) return "Monitor";
  return baseBand;
}
