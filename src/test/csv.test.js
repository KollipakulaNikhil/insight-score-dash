import { describe, expect, it } from "vitest";
import { parseStudentCsv, studentsToCsv } from "@/lib/csv";

const row = (over = {}) => ({
  id: "S-1",
  name: "Asha Rao",
  branch: "CSE",
  semester: 5,
  score: 77.4,
  band: "Monitor",
  cgpa: 7.74,
  attendance: 90.46,
  lms: null,
  academicRisk: "Low",
  placementRisk: "Medium",
  alerts: 2,
  segment: "Steady, no standout pattern",
  mentorName: "Prof. Iyer",
  ...over,
});

describe("studentsToCsv", () => {
  it("writes a header and one line per student", () => {
    const lines = studentsToCsv([row(), row({ id: "S-2" })]).split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[0].startsWith("student_id,name,branch")).toBe(true);
    expect(lines[1]).toBe(
      'S-1,Asha Rao,CSE,5,77,Monitor,7.74,90.5,,Low,Medium,2,"Steady, no standout pattern",Prof. Iyer',
    );
  });
  it("leaves unknown values empty instead of writing zero", () => {
    const line = studentsToCsv([
      row({ score: null, band: null, cgpa: null, attendance: null }),
    ]).split("\r\n")[1];
    expect(line.split(",").slice(4, 9)).toEqual(["", "", "", "", ""]);
  });
  it("quotes commas and quotes, and defuses spreadsheet formulas", () => {
    const line = studentsToCsv([row({ name: '=HYPERLINK("http://x","click")' })]).split("\r\n")[1];
    expect(line.startsWith('S-1,"\'=HYPERLINK(""http://x"",""click"")",')).toBe(true);
  });
});

describe("parseStudentCsv", () => {
  const header = "student_id,name,branch,semester,grad_year,cgpa";
  it("accepts a valid row and flags duplicates and bad values", () => {
    const { results } = parseStudentCsv(
      [header, "S-1,Asha,CSE,5,2027,8.2", "S-1,Dup,CSE,5,2027,8.2", "S-2,Ben,CSE,9,2027,8.2"].join(
        "\n",
      ),
      new Set(),
    );
    expect(results[0].student?.id).toBe("S-1");
    expect(results[1].isDuplicate).toBe(true);
    expect(results[2].errors).toContain("semester must be 1–8");
  });
  it("skips ids that already exist and reports missing columns", () => {
    const { results } = parseStudentCsv(
      [header, "S-9,Old,CSE,5,2027,8.2", ",NoId,CSE,5,2027,8.2"].join("\n"),
      new Set(["S-9"]),
    );
    expect(results[0].isDuplicate).toBe(true);
    expect(results[1].missing).toContain("student_id");
  });
});
