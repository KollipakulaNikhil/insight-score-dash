import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { SectionTitle, StatCard } from "@/components/widgets";
import { useAppState, addStudents, reviewComplaint } from "@/lib/store";
import { parseStudentCsv, type CsvRowResult } from "@/lib/csv";
import { SAMPLE_CSV } from "@/lib/seed";
import { componentScores } from "@/lib/scoring";
import { useState } from "react";
import { z } from "zod";
import type { Student } from "@/lib/types";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: "Data Integration & Import — BIB InsightIQ" },
      { name: "description", content: "Manual entry, CSV import with validation, and data quality reporting." },
      { property: "og:title", content: "Data Integration & Import — BIB InsightIQ" },
      { property: "og:description", content: "Manual entry, CSV import with validation, and data quality reporting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DataPage,
});

const manualSchema = z.object({
  id: z.string().trim().regex(/^BIB-\d{4}-\d{3}$/, "Format: BIB-2026-012"),
  name: z.string().trim().min(1, "Required").max(100),
  branch: z.enum(["CSE", "IT", "ECE", "ME"]),
  semester: z.coerce.number().int().min(1).max(8),
  gradYear: z.coerce.number().int().min(2020).max(2035),
  cgpa: z.coerce.number().min(0).max(10),
});

function DataPage() {
  const { students, complaints, importLog } = useAppState();
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<CsvRowResult[] | null>(null);
  const [msg, setMsg] = useState("");
  const [manual, setManual] = useState({ id: "", name: "", branch: "CSE", semester: "6", gradYear: "2027", cgpa: "" });
  const [manualErr, setManualErr] = useState<string[]>([]);

  const sources = [
    { name: "Academics", has: (s: Student) => s.cgpa > 0 },
    { name: "Attendance", has: (s: Student) => s.subjects.length > 0 },
    { name: "LMS", has: (s: Student) => s.lms.length > 0 },
    { name: "Skills", has: (s: Student) => Object.values(s.skills).some((v) => v > 0) },
    { name: "Engagement", has: (s: Student) => s.engagement.length > 0 },
    { name: "Placement", has: (s: Student) => s.assessmentsRequired > 0 },
    { name: "Feedback", has: (s: Student) => s.facultyFeedback.length + s.studentFeedback.length > 0 },
  ];
  const missingVals = students.reduce((a, s) => a + Object.values(componentScores(s)).filter((v) => v === null).length, 0);

  const runPreview = () => {
    setMsg("");
    if (!csv.trim()) return setMsg("Paste CSV or load the sample first.");
    try {
      setPreview(parseStudentCsv(csv, new Set(students.map((s) => s.id))).results);
    } catch {
      setMsg("Could not parse CSV. Check the header row.");
    }
  };

  const commit = () => {
    if (!preview) return;
    const ok = preview.filter((r) => r.student).map((r) => r.student!);
    addStudents(ok, { date: new Date().toISOString().slice(0, 16).replace("T", " "), added: ok.length, duplicates: preview.filter((r) => r.isDuplicate).length, errors: preview.filter((r) => !r.student).length });
    setMsg(`Imported ${ok.length} student(s).`);
    setPreview(null);
    setCsv("");
  };

  const addManual = () => {
    const p = manualSchema.safeParse(manual);
    if (!p.success) return setManualErr(p.error.issues.map((i) => `${i.path[0]}: ${i.message}`));
    if (students.some((s) => s.id === p.data.id)) return setManualErr(["id: duplicate student ID"]);
    setManualErr([]);
    addStudents([{ ...p.data, mentorId: "FAC-01", semesterGrades: [p.data.cgpa], backlogs: 0, subjects: [], lms: [], skills: { coding: 0, aptitude: 0, analytical: 0, verbal: 0, communication: 0 }, engagement: [], resumeCompleteness: 0, targetRoles: [], assessmentsCompleted: 0, assessmentsRequired: 0, facultyFeedback: [], studentFeedback: [] }], { date: new Date().toISOString().slice(0, 16).replace("T", " "), added: 1, duplicates: 0, errors: 0 });
    setManual({ ...manual, id: "", name: "", cgpa: "" });
    setMsg(`Added ${p.data.name}.`);
  };

  return (
    <Layout allow={["admin"]}>
      <h1 className="mb-4 font-display text-2xl font-bold">Data Integration & Quality</h1>
      <p className="mb-4 text-sm text-muted-foreground">Demo mode: all data is fictional and stored in this browser. No live university system is connected.</p>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Student records" value={String(students.length)} />
        <StatCard label="Missing component values" value={String(missingVals)} tone={missingVals ? "warning" : "success"} />
        <StatCard label="Imports" value={String(importLog.length)} />
        <StatCard label="Unreviewed complaints" value={String(complaints.filter((c) => !c.reviewed).length)} tone="warning" />
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4">
        <SectionTitle sub="Share of students with data from each source, linked by student ID">Source coverage</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {sources.map((src) => {
            const n = students.filter(src.has).length;
            const pct = students.length ? (n / students.length) * 100 : 0;
            return <div key={src.name} className="rounded-lg border p-3 text-center"><div className="text-xs text-muted-foreground">{src.name}</div><div className={`font-display text-xl font-bold ${pct < 80 ? "text-warning" : "text-success"}`}>{pct.toFixed(0)}%</div><div className="text-xs text-muted-foreground">{n}/{students.length}</div></div>;
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle sub="Preview, validate, and detect duplicates before importing">CSV import</SectionTitle>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={7} className="w-full rounded-md border bg-background p-2 font-mono text-xs" placeholder="student_id,name,branch,semester,grad_year,cgpa,..." />
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setCsv(SAMPLE_CSV)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent/60">Load sample CSV</button>
            <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:bg-accent/60">
              Upload file
              <input type="file" accept=".csv" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setCsv(await f.text()); }} />
            </label>
            <button onClick={runPreview} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Preview & validate</button>
          </div>
          {msg && <p className="mt-2 text-sm text-primary">{msg}</p>}
          {preview && (
            <div className="mt-3">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-muted-foreground"><th>Row</th><th>ID</th><th>Name</th><th>Status</th></tr></thead>
                <tbody>
                  {preview.map((r) => (
                    <tr key={r.row} className="border-t">
                      <td className="py-1">{r.row}</td>
                      <td>{r.student?.id ?? "—"}</td>
                      <td>{r.student?.name ?? "—"}</td>
                      <td className={r.student ? "text-success" : "text-destructive"}>
                        {r.student ? "Valid" : [...r.errors, ...(r.missing.length ? [`missing: ${r.missing.join(", ")}`] : [])].join("; ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={commit} disabled={!preview.some((r) => r.student)} className="mt-3 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-40">
                Import {preview.filter((r) => r.student).length} valid row(s)
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <SectionTitle>Manual student entry</SectionTitle>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <input placeholder="BIB-2026-012" value={manual.id} onChange={(e) => setManual({ ...manual, id: e.target.value })} className="rounded-md border bg-background px-3 py-2" />
            <input placeholder="Full name" value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} className="rounded-md border bg-background px-3 py-2" />
            <select value={manual.branch} onChange={(e) => setManual({ ...manual, branch: e.target.value })} className="rounded-md border bg-card px-3 py-2">{["CSE", "IT", "ECE", "ME"].map((b) => <option key={b}>{b}</option>)}</select>
            <input placeholder="Semester" value={manual.semester} onChange={(e) => setManual({ ...manual, semester: e.target.value })} className="rounded-md border bg-background px-3 py-2" />
            <input placeholder="Grad year" value={manual.gradYear} onChange={(e) => setManual({ ...manual, gradYear: e.target.value })} className="rounded-md border bg-background px-3 py-2" />
            <input placeholder="CGPA (0-10)" value={manual.cgpa} onChange={(e) => setManual({ ...manual, cgpa: e.target.value })} className="rounded-md border bg-background px-3 py-2" />
          </div>
          {manualErr.length > 0 && <ul className="mt-2 text-xs text-destructive">{manualErr.map((e) => <li key={e}>{e}</li>)}</ul>}
          <button onClick={addManual} className="mt-3 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">Add student</button>
          <p className="mt-2 text-xs text-muted-foreground">Unfilled sources (attendance, LMS…) are marked missing, not zero.</p>

          <div className="mt-6">
            <SectionTitle sub="Authorized human review required — content hidden from other roles">Confidential complaints</SectionTitle>
            {complaints.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-t py-2 text-sm">
                <span>{c.id} · {c.date} {c.reviewed ? <span className="text-muted-foreground">— {c.text}</span> : <span className="text-muted-foreground">— [content hidden until reviewed]</span>}</span>
                {c.reviewed ? <span className="text-xs text-success">Reviewed by {c.reviewedBy}</span> : <button onClick={() => reviewComplaint(c.id, "Admin (demo)")} className="rounded border px-2 py-0.5 text-xs">Review as admin</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
