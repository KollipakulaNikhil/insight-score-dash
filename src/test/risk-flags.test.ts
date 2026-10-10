import { describe, it, expect } from "vitest";
import { academicRisk, placementRisk, effectiveBand, ACADEMIC_SIGNALS, PLACEMENT_SIGNALS } from "@/lib/risk-flags";
import type { Student } from "@/lib/types";

function baseStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: "T-1", name: "Test", branch: "CSE", semester: 5, gradYear: 2027, mentorId: "FAC-01",
    cgpa: 8.5, semesterGrades: [8.2, 8.5], backlogs: 0,
    subjects: [{ subject: "Math", marks: 85, classesHeld: 40, classesAttended: 38 }],
    lms: [{ subject: "Math", units: [{ unit: 1, title: "U1", lessons: [{ title: "L1", completed: true, resource: "" }], assignment: { title: "A1", deadline: "2026-11-01", submitted: true, marks: 90 } }] }],
    skills: { coding: 80, aptitude: 70, analytical: 70, verbal: 70, communication: 70 },
    engagement: [], resumeCompleteness: 90, targetRoles: [], assessmentsCompleted: 3, assessmentsRequired: 3,
    facultyFeedback: [], studentFeedback: [],
    ...overrides,
  };
}

describe("risk flags", () => {
  it("healthy student scores Low with zero points and no drivers", () => {
    const a = academicRisk(baseStudent());
    expect(a.level).toBe("Low");
    expect(a.points).toBe(0);
    expect(a.drivers).toHaveLength(0);
  });

  it("low CGPA + low attendance + backlogs reach High and list sorted drivers", () => {
    const s = baseStudent({
      cgpa: 6.0, backlogs: 2,
      subjects: [{ subject: "Math", marks: 50, classesHeld: 40, classesAttended: 20 }],
    });
    const a = academicRisk(s);
    expect(a.level).toBe("High"); // 30 + 25 + 20 = 75
    expect(a.points).toBe(75);
    expect(a.drivers.map((d) => d.points)).toEqual([30, 25, 20]);
    expect(a.drivers[0]!.signal).toBe("CGPA below 6.5");
  });

  it("missing inputs add no points and are reported as insufficient data", () => {
    const s = baseStudent({ cgpa: 0, subjects: [], semesterGrades: [] });
    const a = academicRisk(s);
    expect(a.points).toBe(0);
    expect(a.insufficient).toContain("CGPA below 6.5");
    expect(a.insufficient).toContain("Attendance below 75%");
    expect(a.insufficient).toContain("Declining SGPA trend");
  });

  it("placement flag fires on weak resume and pending assessments", () => {
    const s = baseStudent({ resumeCompleteness: 50, assessmentsCompleted: 1, assessmentsRequired: 4 });
    const p = placementRisk(s);
    // weak resume 20 + pending assessments 20 + low readiness (37.5%) 30
    expect(p.points).toBe(70);
    expect(p.level).toBe("High");
  });

  it("a High flag prevents the On Track band", () => {
    const high = { level: "High" as const, points: 50, drivers: [], insufficient: [] };
    const low = { level: "Low" as const, points: 0, drivers: [], insufficient: [] };
    expect(effectiveBand(85, "On Track", high, low)).toBe("Monitor");
    expect(effectiveBand(85, "On Track", low, low)).toBe("On Track");
    expect(effectiveBand(50, "Needs Attention", high, low)).toBe("Needs Attention");
  });

  it("config tables expose signal, threshold and points for every rule", () => {
    for (const sig of [...ACADEMIC_SIGNALS, ...PLACEMENT_SIGNALS]) {
      expect(sig.label).toBeTruthy();
      expect(sig.threshold).toBeTruthy();
      expect(sig.points).toBeGreaterThan(0);
    }
  });
});
