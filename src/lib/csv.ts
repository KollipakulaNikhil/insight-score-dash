import type { Student } from "./types";

export interface CsvRowResult {
  row: number;
  student?: Student | undefined;
  errors: string[];
  isDuplicate: boolean;
  missing: string[];
}

const REQUIRED = ["student_id", "name", "branch", "semester", "grad_year", "cgpa"];

export function parseStudentCsv(text: string, existingIds: Set<string>): { results: CsvRowResult[]; headers: string[] } {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const results: CsvRowResult[] = [];
  const seen = new Set(existingIds);

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim());
    const rec: Record<string, string> = {};
    headers.forEach((h, j) => (rec[h] = vals[j] ?? ""));
    const errors: string[] = [];
    const missing: string[] = [];

    for (const f of REQUIRED) if (!rec[f]) missing.push(f);
    const cgpa = parseFloat(rec["cgpa"] ?? "");
    if (rec["cgpa"] && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) errors.push("cgpa must be 0–10");
    const sem = parseInt(rec["semester"] ?? "");
    if (rec["semester"] && (isNaN(sem) || sem < 1 || sem > 8)) errors.push("semester must be 1–8");
    const gy = parseInt(rec["grad_year"] ?? "");
    if (rec["grad_year"] && (isNaN(gy) || gy < 2020 || gy > 2035)) errors.push("grad_year invalid");
    const att = parseFloat(rec["attendance_pct"] ?? "");
    if (rec["attendance_pct"] && (isNaN(att) || att < 0 || att > 100)) errors.push("attendance_pct must be 0–100");

    const sid = rec["student_id"] ?? "";
    const isDuplicate = sid ? seen.has(sid) : false;
    if (isDuplicate) errors.push("duplicate student_id");
    if (sid) seen.add(sid);

    let student: Student | undefined;
    if (errors.length === 0 && missing.length === 0) {
      const num = (k: string, d = 0) => {
        const v = parseFloat(rec[k]);
        return isNaN(v) ? d : v;
      };
      const attPct = isNaN(att) ? null : att;
      const held = 40;
      const attended = attPct === null ? 0 : Math.round((attPct / 100) * held);
      student = {
        id: sid, name: rec["name"] ?? "", branch: rec["branch"] ?? "", semester: sem, gradYear: gy,
        mentorId: "FAC-01", cgpa, semesterGrades: [cgpa], backlogs: parseInt(rec["backlogs"] ?? "") || 0,
        subjects: attPct === null ? [] : [{ subject: "Imported aggregate", marks: 0, classesHeld: held, classesAttended: attended }],
        lms: [],
        skills: { coding: num("coding"), aptitude: num("aptitude"), analytical: num("analytical"), verbal: num("verbal"), communication: num("communication") },
        engagement: [], resumeCompleteness: num("resume_completeness"), targetRoles: [],
        assessmentsCompleted: 0, assessmentsRequired: 0, facultyFeedback: [], studentFeedback: [],
      };
    }
    results.push({ row: i + 1, student, errors, isDuplicate, missing });
  }
  return { results, headers };
}
