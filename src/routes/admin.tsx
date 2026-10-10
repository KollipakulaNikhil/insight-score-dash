import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard, SectionTitle, BandBadge, EmptyState } from "@/components/widgets";
import { useAppState } from "@/lib/store";
import { successScore, studentAttendancePct, lmsCompletion, componentScores } from "@/lib/scoring";
import { riskBand } from "@/lib/types";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administrator Dashboard — BIB InsightIQ" },
      { name: "description", content: "Campus KPIs, department comparisons, trends, and data quality." },
      { property: "og:title", content: "Administrator Dashboard — BIB InsightIQ" },
      { property: "og:description", content: "Campus KPIs, department comparisons, trends, and data quality." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { students, interventions, importLog } = useAppState();
  const [branch, setBranch] = useState("all");
  const branches = [...new Set(students.map((s) => s.branch))];
  const filtered = branch === "all" ? students : students.filter((s) => s.branch === branch);

  const stats = useMemo(() => {
    const scored = filtered.map((s) => ({ s, r: successScore(s) }));
    const avg = (arr: (number | null)[]) => {
      const v = arr.filter((x): x is number => x !== null);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const bands: Record<string, number> = { "On Track": 0, Monitor: 0, "Needs Attention": 0, "High Priority": 0 };
    scored.forEach(({ r }) => r.score !== null && bands[riskBand(r.score)]++);
    return {
      avgScore: avg(scored.map((x) => x.r.score)),
      avgCgpa: avg(filtered.map((s) => (s.cgpa > 0 ? s.cgpa : null))),
      avgAtt: avg(filtered.map(studentAttendancePct)),
      avgLms: avg(filtered.map(lmsCompletion)),
      avgPlace: avg(filtered.map((s) => componentScores(s).placement)),
      bands,
    };
  }, [filtered]);

  const deptRows = branches.map((b) => {
    const ss = students.filter((s) => s.branch === b);
    const sc = ss.map((s) => successScore(s).score).filter((x): x is number => x !== null);
    return { branch: b, students: ss.length, avgScore: sc.length ? +(sc.reduce((a, c) => a + c, 0) / sc.length).toFixed(1) : 0 };
  });

  const trendData = [1, 2, 3, 4, 5].map((sem) => ({
    sem: `Sem ${sem}`,
    avgSgpa: +(
      filtered.filter((s) => s.semesterGrades.length >= sem).reduce((a, s) => a + s.semesterGrades[sem - 1], 0) /
      Math.max(1, filtered.filter((s) => s.semesterGrades.length >= sem).length)
    ).toFixed(2),
  }));

  const quality = useMemo(() => {
    let missing = 0;
    const fields = filtered.flatMap((s) => Object.values(componentScores(s)));
    fields.forEach((v) => v === null && missing++);
    return { total: fields.length, missing, coverage: fields.length ? +(((fields.length - missing) / fields.length) * 100).toFixed(1) : 100 };
  }, [filtered]);

  const fmt = (v: number | null, suffix = "") => (v === null ? "—" : v.toFixed(1) + suffix);

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Administrator Dashboard</h1>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-md border bg-card px-3 py-1.5 text-sm">
          <option value="all">All branches</option>
          {branches.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Avg success score" value={fmt(stats.avgScore)} sub="/100" />
        <StatCard label="Avg CGPA" value={fmt(stats.avgCgpa)} />
        <StatCard label="Avg attendance" value={fmt(stats.avgAtt, "%")} tone={stats.avgAtt !== null && stats.avgAtt < 75 ? "danger" : "default"} />
        <StatCard label="LMS completion" value={fmt(stats.avgLms, "%")} />
        <StatCard label="Placement readiness" value={fmt(stats.avgPlace, "%")} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle>Risk distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={Object.entries(stats.bands).map(([name, count]) => ({ name, count }))}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle>Academic trend (avg SGPA by semester)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="sem" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
              <Legend />
              <Line type="monotone" dataKey="avgSgpa" stroke="var(--primary)" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle>Department comparison</SectionTitle>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="py-1">Branch</th><th>Students</th><th>Avg score</th></tr></thead>
            <tbody>
              {deptRows.map((d) => (
                <tr key={d.branch} className="border-t">
                  <td className="py-2 font-medium">{d.branch}</td>
                  <td>{d.students}</td>
                  <td>{d.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle sub="Missing data is flagged, never treated as zero">Data quality</SectionTitle>
          <div className="flex items-center gap-6">
            <StatCard label="Source coverage" value={`${quality.coverage}%`} tone={quality.coverage < 80 ? "warning" : "success"} />
            <StatCard label="Missing component values" value={String(quality.missing)} tone={quality.missing ? "warning" : "success"} />
            <StatCard label="Imports run" value={String(importLog.length)} />
          </div>
          {importLog.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {importLog.map((l, i) => <li key={i}>{l.date}: +{l.added} added, {l.duplicates} duplicates, {l.errors} errors</li>)}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4">
        <SectionTitle sub="Same dataset as student and faculty views">Students ({filtered.length})</SectionTitle>
        {filtered.length === 0 ? <EmptyState title="No students in this filter" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="py-1">ID</th><th>Name</th><th>Branch</th><th>Sem</th><th>CGPA</th><th>Attendance</th><th>Score</th><th>Band</th><th>Interventions</th></tr></thead>
              <tbody>
                {filtered.map((s) => {
                  const r = successScore(s);
                  const att = studentAttendancePct(s);
                  const open = interventions.filter((i) => i.studentId === s.id && i.status !== "resolved").length;
                  return (
                    <tr key={s.id} className="border-t hover:bg-accent/40">
                      <td className="py-2"><Link to="/student/$id" params={{ id: s.id }} className="text-primary hover:underline">{s.id}</Link></td>
                      <td className="font-medium">{s.name}</td>
                      <td>{s.branch}</td><td>{s.semester}</td>
                      <td>{s.cgpa.toFixed(2)}</td>
                      <td>{att === null ? "—" : att.toFixed(1) + "%"}</td>
                      <td className="font-semibold">{r.score ?? "—"}</td>
                      <td><BandBadge score={r.score} /></td>
                      <td>{open > 0 ? <span className="text-warning">{open} open</span> : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
