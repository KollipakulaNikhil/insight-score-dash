const cell = (v) => {
  const text = v === null || v === undefined ? "" : String(v);
  // Quote anything with a comma, quote or newline, and neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** Turns the student list shown on screen into CSV text a spreadsheet can open. */
export function studentsToCsv(rows) {
  const head = [
    "student_id",
    "name",
    "branch",
    "semester",
    "success_score",
    "status",
    "cgpa",
    "attendance_pct",
    "lms_pct",
    "academic_risk",
    "placement_risk",
    "alerts",
    "segment",
    "teacher",
  ];
  const num = (v, d = 1) => (v === null ? "" : v.toFixed(d));
  const lines = rows.map((r) =>
    [
      r.id,
      r.name,
      r.branch,
      r.semester,
      num(r.score, 0),
      r.band ?? "",
      num(r.cgpa, 2),
      num(r.attendance),
      num(r.lms),
      r.academicRisk,
      r.placementRisk,
      r.alerts,
      r.segment,
      r.mentorName,
    ]
      .map(cell)
      .join(","),
  );
  return [head.join(","), ...lines].join("\r\n");
}

export const CSV_TEMPLATE = `student_id,name,branch,semester,grad_year,cgpa,backlogs,attendance_pct,coding,aptitude,analytical,verbal,communication,resume_completeness
S-1001,Asha Rao,CSE,5,2027,8.2,0,88,70,65,72,68,75,80
`;
const REQUIRED = ["student_id", "name", "branch", "semester", "grad_year", "cgpa"];
export function parseStudentCsv(text, existingIds) {
  const lines = text.trim().split(/\r?\n/);
  const headers = (lines[0] ?? "").split(",").map((h) => h.trim().toLowerCase());
  const results = [];
  const seen = new Set(existingIds);
  for (let i = 1; i < lines.length; i++) {
    const vals = (lines[i] ?? "").split(",").map((v) => v.trim());
    const rec = {};
    headers.forEach((h, j) => (rec[h] = vals[j] ?? ""));
    const errors = [];
    const missing = [];
    for (const f of REQUIRED) if (!rec[f]) missing.push(f);
    const cgpa = parseFloat(rec["cgpa"] ?? "");
    if (rec["cgpa"] && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) errors.push("cgpa must be 0–10");
    const sem = parseInt(rec["semester"] ?? "");
    if (rec["semester"] && (isNaN(sem) || sem < 1 || sem > 8)) errors.push("semester must be 1–8");
    const gy = parseInt(rec["grad_year"] ?? "");
    if (rec["grad_year"] && (isNaN(gy) || gy < 2020 || gy > 2035)) errors.push("grad_year invalid");
    const att = parseFloat(rec["attendance_pct"] ?? "");
    if (rec["attendance_pct"] && (isNaN(att) || att < 0 || att > 100))
      errors.push("attendance_pct must be 0–100");
    const sid = rec["student_id"] ?? "";
    const isDuplicate = sid ? seen.has(sid) : false;
    if (isDuplicate) errors.push("duplicate student_id");
    if (sid) seen.add(sid);
    let student;
    if (errors.length === 0 && missing.length === 0) {
      const num = (k, d = 0) => {
        const v = parseFloat(rec[k] ?? "");
        return isNaN(v) ? d : v;
      };
      const attPct = isNaN(att) ? null : att;
      const held = 40;
      const attended = attPct === null ? 0 : Math.round((attPct / 100) * held);
      student = {
        id: sid,
        name: rec["name"] ?? "",
        branch: rec["branch"] ?? "",
        semester: sem,
        gradYear: gy,
        mentorId: "",
        cgpa,
        semesterGrades: [cgpa],
        backlogs: parseInt(rec["backlogs"] ?? "") || 0,
        subjects:
          attPct === null
            ? []
            : [
                {
                  subject: "Imported aggregate",
                  marks: 0,
                  classesHeld: held,
                  classesAttended: attended,
                },
              ],
        lms: [],
        skills: {
          coding: num("coding"),
          aptitude: num("aptitude"),
          analytical: num("analytical"),
          verbal: num("verbal"),
          communication: num("communication"),
        },
        engagement: [],
        hasEngagementData: false,
        resumeCompleteness: num("resume_completeness"),
        targetRoles: [],
        assessmentsCompleted: 0,
        assessmentsRequired: 0,
        facultyFeedback: [],
        studentFeedback: [],
      };
    }
    results.push({ row: i + 1, student, errors, isDuplicate, missing });
  }
  return { results, headers };
}
