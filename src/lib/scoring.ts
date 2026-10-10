import type { Student, ScoreWeights, PlacementDrive } from "./types";
import { DEFAULT_WEIGHTS, riskBand } from "./types";

// ---------- Attendance ----------
export function attendancePct(attended: number, held: number): number | null {
  if (held <= 0) return null; // missing data is not zero
  return (attended / held) * 100;
}

export function studentAttendancePct(s: Student): number | null {
  const held = s.subjects.reduce((a, x) => a + x.classesHeld, 0);
  const att = s.subjects.reduce((a, x) => a + x.classesAttended, 0);
  return attendancePct(att, held);
}

// Configurable marks bands
export const ATTENDANCE_BANDS = [
  { min: 90, marks: 5 },
  { min: 85, marks: 4 },
  { min: 80, marks: 3 },
  { min: 75, marks: 2 },
  { min: 0, marks: 0 },
];

export function attendanceMarks(pct: number | null): number | null {
  if (pct === null) return null;
  for (const b of ATTENDANCE_BANDS) if (pct >= b.min) return b.marks;
  return 0;
}

// Classes required to reach target% (must attend every future class)
export function classesNeededForTarget(attended: number, held: number, target: number): number {
  const t = target / 100;
  if (attended / held >= t) return 0;
  // (attended + x) / (held + x) >= t  =>  x >= (t*held - attended) / (1 - t)
  return Math.max(0, Math.ceil((t * held - attended) / (1 - t)));
}

// Max additional classes that can be missed while staying >= target
export function maxMissableClasses(attended: number, held: number, target: number): number {
  const t = target / 100;
  // attended / (held + x) >= t  =>  x <= attended/t - held
  return Math.max(0, Math.floor(attended / t - held));
}

// ---------- LMS ----------
export function lmsCompletion(s: Student): number | null {
  let total = 0;
  let done = 0;
  for (const sub of s.lms) {
    for (const u of sub.units) {
      for (const l of u.lessons) {
        total++;
        if (l.completed) done++;
      }
      total++;
      if (u.assignment.submitted) done++;
    }
  }
  return total === 0 ? null : (done / total) * 100;
}

export function pendingAssignments(s: Student) {
  return s.lms.flatMap((sub) =>
    sub.units
      .filter((u) => !u.assignment.submitted)
      .map((u) => ({ subject: sub.subject, ...u.assignment })),
  );
}

// ---------- Component scores (each 0-100, null when data missing) ----------
export function componentScores(s: Student) {
  const academics = s.cgpa > 0 ? s.cgpa * 10 : null;
  const attendance = studentAttendancePct(s);
  const lms = lmsCompletion(s);
  const verified = s.engagement.filter((e) => e.verified).length;
  const engagement = s.engagement.length === 0 ? null : Math.min(100, verified * 20);
  const sk = s.skills;
  const skillsVals = [sk.coding, sk.aptitude, sk.analytical, sk.verbal, sk.communication];
  const skills = skillsVals.every((v) => v >= 0)
    ? skillsVals.reduce((a, b) => a + b, 0) / skillsVals.length
    : null;
  const assessmentPct =
    s.assessmentsRequired > 0 ? (s.assessmentsCompleted / s.assessmentsRequired) * 100 : null;
  const placement =
    s.resumeCompleteness >= 0 && assessmentPct !== null
      ? s.resumeCompleteness * 0.5 + assessmentPct * 0.5
      : null;
  return { academics, attendance, lms, engagement, skills, placement };
}

export interface ScoreResult {
  score: number | null; // null if no data at all
  completeness: number; // % of components with data
  components: ReturnType<typeof componentScores>;
  band: string | null;
  positives: string[];
  negatives: string[];
  missing: string[];
}

export function successScore(s: Student, weights: ScoreWeights = DEFAULT_WEIGHTS): ScoreResult {
  const c = componentScores(s);
  const entries = Object.entries(c) as [keyof ScoreWeights, number | null][];
  const present = entries.filter(([, v]) => v !== null);
  const missing = entries.filter(([, v]) => v === null).map(([k]) => k);
  const completeness = (present.length / entries.length) * 100;
  if (present.length === 0) {
    return { score: null, completeness: 0, components: c, band: null, positives: [], negatives: [], missing };
  }
  // Renormalize weights over available components — missing data is NOT zero
  const wSum = present.reduce((a, [k]) => a + weights[k], 0);
  const score = present.reduce((a, [k, v]) => a + (v! * weights[k]) / wSum, 0);

  const positives: string[] = [];
  const negatives: string[] = [];
  if (c.academics !== null) (c.academics >= 80 ? positives : c.academics < 60 ? negatives : []).push(`CGPA ${s.cgpa.toFixed(2)}`);
  if (c.attendance !== null) (c.attendance >= 85 ? positives : c.attendance < 75 ? negatives : []).push(`Attendance ${c.attendance.toFixed(1)}%`);
  if (c.lms !== null) (c.lms >= 80 ? positives : c.lms < 50 ? negatives : []).push(`LMS completion ${c.lms.toFixed(0)}%`);
  if (c.engagement !== null && c.engagement >= 40) positives.push(`${s.engagement.filter((e) => e.verified).length} verified engagement activities`);
  if (c.skills !== null) (c.skills >= 75 ? positives : c.skills < 55 ? negatives : []).push(`Avg skills ${c.skills.toFixed(0)}/100`);
  if (c.placement !== null) (c.placement >= 75 ? positives : c.placement < 50 ? negatives : []).push(`Placement readiness ${c.placement.toFixed(0)}%`);
  if (s.backlogs > 0) negatives.push(`${s.backlogs} active backlog${s.backlogs > 1 ? "s" : ""}`);

  return { score: Math.round(score * 10) / 10, completeness, components: c, band: riskBand(score), positives, negatives, missing };
}

// ---------- Placement eligibility ----------
export type CriterionResult = "Pass" | "Fail" | "Unknown";
export interface EligibilityResult {
  drive: PlacementDrive;
  criteria: { label: string; result: CriterionResult; detail: string }[];
  eligible: boolean;
  explanation: string;
}

export function checkEligibility(s: Student, d: PlacementDrive): EligibilityResult {
  const criteria: EligibilityResult["criteria"] = [
    {
      label: `CGPA ≥ ${d.minCgpa}`,
      result: s.cgpa > 0 ? (s.cgpa >= d.minCgpa ? "Pass" : "Fail") : "Unknown",
      detail: s.cgpa > 0 ? `Student CGPA ${s.cgpa.toFixed(2)}` : "CGPA on record missing",
    },
    {
      label: `Backlogs ≤ ${d.maxBacklogs}`,
      result: s.backlogs <= d.maxBacklogs ? "Pass" : "Fail",
      detail: `${s.backlogs} active backlogs`,
    },
    {
      label: `Branch: ${d.branches.join("/")}`,
      result: d.branches.includes(s.branch) ? "Pass" : "Fail",
      detail: `Student branch ${s.branch}`,
    },
    {
      label: `Graduation year ${d.gradYear}`,
      result: s.gradYear === d.gradYear ? "Pass" : "Fail",
      detail: `Student graduates ${s.gradYear}`,
    },
  ];
  if (d.requiresAssessment) {
    criteria.push({
      label: "Assessment completed",
      result:
        s.assessmentsRequired > 0
          ? s.assessmentsCompleted >= s.assessmentsRequired
            ? "Pass"
            : "Fail"
          : "Unknown",
      detail:
        s.assessmentsRequired > 0
          ? `${s.assessmentsCompleted}/${s.assessmentsRequired} assessments done`
          : "Assessment record missing",
    });
  }
  const failed = criteria.filter((c) => c.result === "Fail");
  const unknown = criteria.filter((c) => c.result === "Unknown");
  const eligible = failed.length === 0 && unknown.length === 0;
  const explanation = eligible
    ? "All criteria passed — eligible."
    : failed.length > 0
      ? `Not eligible: failed ${failed.map((c) => c.label).join(", ")}.`
      : `Eligibility unknown: missing data for ${unknown.map((c) => c.label).join(", ")}. Cannot be marked eligible until resolved.`;
  return { drive: d, criteria, eligible, explanation };
}

// ---------- Cross-source insights ----------
export interface Insight {
  studentId: string;
  studentName: string;
  type: string;
  detail: string;
  severity: "info" | "warning" | "critical";
}

export function crossSourceInsights(students: Student[]): Insight[] {
  const out: Insight[] = [];
  for (const s of students) {
    const att = studentAttendancePct(s);
    const lms = lmsCompletion(s);
    const c = componentScores(s);
    const grades = s.semesterGrades;
    const firstG = grades[0] ?? 0;
    const lastG = grades[grades.length - 1] ?? 0;
    const declining = grades.length >= 2 && lastG < firstG - 0.5;
    let riskCount = 0;

    if (s.cgpa >= 8 && att !== null && att < 75) {
      riskCount++;
      out.push({ studentId: s.id, studentName: s.name, type: "Good CGPA, poor attendance", detail: `CGPA ${s.cgpa.toFixed(2)} but attendance ${att.toFixed(1)}% — below the 75% threshold.`, severity: "warning" });
    }
    if (att !== null && att >= 90 && declining) {
      riskCount++;
      out.push({ studentId: s.id, studentName: s.name, type: "High attendance, declining academics", detail: `Attendance ${att.toFixed(0)}% but SGPA fell from ${firstG.toFixed(1)} to ${lastG.toFixed(1)}.`, severity: "warning" });
    }
    if (s.cgpa >= 7.5 && lms !== null && lms < 60) {
      riskCount++;
      out.push({ studentId: s.id, studentName: s.name, type: "Good marks, incomplete LMS", detail: `CGPA ${s.cgpa.toFixed(2)} but only ${lms.toFixed(0)}% LMS completion with ${pendingAssignments(s).length} pending assignments.`, severity: "info" });
    }
    if (s.skills.coding >= 80 && s.skills.aptitude < 55) {
      riskCount++;
      out.push({ studentId: s.id, studentName: s.name, type: "Strong coding, weak aptitude", detail: `Coding ${s.skills.coding}/100 vs aptitude ${s.skills.aptitude}/100 — aptitude practice recommended.`, severity: "info" });
    }
    if (s.cgpa >= 8 && c.placement !== null && c.placement < 55) {
      riskCount++;
      out.push({ studentId: s.id, studentName: s.name, type: "High CGPA, low placement readiness", detail: `CGPA ${s.cgpa.toFixed(2)} but placement readiness ${c.placement.toFixed(0)}% (resume ${s.resumeCompleteness}%, assessments ${s.assessmentsCompleted}/${s.assessmentsRequired}).`, severity: "critical" });
    }
    if (riskCount >= 2) {
      out.push({ studentId: s.id, studentName: s.name, type: "Multiple simultaneous risk indicators", detail: `${riskCount} cross-source risk signals active at once — prioritized for mentor review.`, severity: "critical" });
    }
  }
  return out;
}

export function recommendations(s: Student): string[] {
  const recs: string[] = [];
  const att = studentAttendancePct(s);
  const lms = lmsCompletion(s);
  if (att !== null && att < 75) recs.push(`Attend the next ${classesNeededForTarget(s.subjects.reduce((a, x) => a + x.classesAttended, 0), s.subjects.reduce((a, x) => a + x.classesHeld, 0), 75)} classes consecutively to reach the 75% attendance requirement.`);
  if (lms !== null && lms < 70) recs.push(`Complete ${pendingAssignments(s).length} pending LMS assignment(s) before their deadlines.`);
  if (s.skills.aptitude < 60) recs.push("Schedule weekly aptitude practice sessions (target: 60+ score).");
  if (s.resumeCompleteness < 80) recs.push(`Resume is ${s.resumeCompleteness}% complete — add missing sections with the placement cell.`);
  if (s.assessmentsCompleted < s.assessmentsRequired) recs.push(`Finish ${s.assessmentsRequired - s.assessmentsCompleted} remaining placement assessment(s).`);
  if (s.backlogs > 0) recs.push(`Clear ${s.backlogs} backlog subject(s) in the next supplementary exam window.`);
  if (recs.length === 0) recs.push("On track — maintain current performance and explore advanced certifications.");
  return recs;
}
