import { describe, expect, it } from "vitest";
import { buildRows, summarize } from "@/lib/campus-derive";
import { buildDemoCampus, DEMO_ROLES, DEMO_STUDENT_ID } from "@/lib/demo-campus";
import { demoTarget } from "@/lib/portal-base";
import { SEED_STUDENTS } from "@/lib/seed-students";
import { studentSchema } from "@/lib/student-validation";

describe("demo walkthrough data", () => {
  it("every seed student passes the same validation as a real record", () => {
    const records = buildDemoCampus("admin").records;
    expect(records).toHaveLength(SEED_STUDENTS.length);
    const bad = records
      .map((r) => [r.id, studentSchema.safeParse(r.record)])
      .filter(([, result]) => !result.success)
      .map(([id, r]) => `${id}: ${r.error.issues[0].path.join(".")} ${r.error.issues[0].message}`);
    expect(bad).toEqual([]);
  });

  it("builds a row for all 300 students for administrators and teachers", () => {
    for (const role of ["admin", "faculty"]) {
      const data = buildDemoCampus(role);
      expect(buildRows(data.records, "2026-10-11")).toHaveLength(300);
    }
  });

  it("shows a student only their own record and interventions", () => {
    const data = buildDemoCampus("student");
    expect(data.records).toHaveLength(1);
    expect(data.records[0].id).toBe(DEMO_STUDENT_ID);
    expect(data.records[0].owner_id).toBe(data.profile.id);
    expect(data.interventions.every((i) => i.student_id === DEMO_STUDENT_ID)).toBe(true);
  });

  it("uses the same summary as the live portal", () => {
    const data = buildDemoCampus("admin");
    const rows = buildRows(data.records, "2026-10-11");
    const summary = summarize(rows, data.interventions, "2026-10-11");
    expect(summary.total).toBe(300);
    expect(DEMO_ROLES).toEqual(["student", "faculty", "admin"]);
  });
});

describe("walkthrough links", () => {
  it("maps live portal paths to the walkthrough route", () => {
    expect(demoTarget("/portal", undefined, "admin")).toEqual({
      to: "/demo-portal/$",
      params: { _splat: "" },
      search: { role: "admin" },
    });
    expect(demoTarget("/portal/students/$id", { id: "BIB-2026-005" }, "faculty").params).toEqual({
      _splat: "students/BIB-2026-005",
    });
  });
});
