import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard, SectionTitle, BandBadge, EmptyState } from "@/components/widgets";
import { useAppState, addIntervention, updateInterventionStatus } from "@/lib/store";
import { successScore, studentAttendancePct, crossSourceInsights } from "@/lib/scoring";
import { academicRisk, placementRisk, type FlagLevel } from "@/lib/risk-flags";
import { MENTORS } from "@/lib/seed";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty Dashboard — BIB InsightIQ" },
      { name: "description", content: "Assigned students, risk distribution, comparisons, and intervention workflow." },
      { property: "og:title", content: "Faculty Dashboard — BIB InsightIQ" },
      { property: "og:description", content: "Assigned students, risk distribution, comparisons, and intervention workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Faculty,
});

function Faculty() {
  const { students, interventions } = useAppState();
  const [mentor, setMentor] = useState("FAC-01");
  const [query, setQuery] = useState("");
  const [bandFilter, setBandFilter] = useState("all");
  const [acadFilter, setAcadFilter] = useState("all");
  const [placeFilter, setPlaceFilter] = useState("all");
  const [compare, setCompare] = useState<string[]>([]);
  const [form, setForm] = useState<{ studentId: string; reason: string; action: string; priority: "low" | "medium" | "high"; followUpDate: string } | null>(null);

  const assigned = students.filter((s) => s.mentorId === mentor);
  const scored = useMemo(() => assigned.map((s) => ({ s, r: successScore(s) })), [assigned]);
  const visible = scored.filter(({ s, r }) => {
    if (query && !`${s.name} ${s.id}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (bandFilter !== "all" && r.band !== bandFilter) return false;
    return true;
  });
  const classAvg = (() => {
    const v = scored.map((x) => x.r.score).filter((x): x is number => x !== null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  })();
  const median = (() => {
    const v = scored.map((x) => x.r.score).filter((x): x is number => x !== null).sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : null;
  })();
  const declining = assigned.filter((s) => s.semesterGrades.length >= 2 && s.semesterGrades.at(-1)! < (s.semesterGrades[0] ?? 0) - 0.5);
  const insights = crossSourceInsights(assigned);
  const myInterventions = interventions.filter((i) => assigned.some((s) => s.id === i.studentId));
  const compareStudents = compare.map((id) => students.find((s) => s.id === id)!).filter(Boolean);

  return (
    <Layout allow={["faculty", "admin"]}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Faculty / Mentor Dashboard</h1>
        <select value={mentor} onChange={(e) => setMentor(e.target.value)} className="rounded-md border bg-card px-3 py-1.5 text-sm">
          {MENTORS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned students" value={String(assigned.length)} />
        <StatCard label="Class avg score" value={classAvg === null ? "—" : classAvg.toFixed(1)} sub={`median ${median ?? "—"}`} />
        <StatCard label="Declining performance" value={String(declining.length)} tone={declining.length ? "warning" : "success"} />
        <StatCard label="Open interventions" value={String(myInterventions.filter((i) => i.status !== "resolved").length)} />
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4">
        <SectionTitle sub="Search, filter by risk band, select up to 3 to compare">Student table</SectionTitle>
        <div className="mb-3 flex flex-wrap gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or ID…" className="rounded-md border bg-background px-3 py-1.5 text-sm" />
          <select value={bandFilter} onChange={(e) => setBandFilter(e.target.value)} className="rounded-md border bg-card px-3 py-1.5 text-sm">
            <option value="all">All bands</option>
            {["On Track", "Monitor", "Needs Attention", "High Priority"].map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        {visible.length === 0 ? <EmptyState title="No students match" hint="Adjust the search or filters." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th></th><th className="py-1">Student</th><th>CGPA</th><th>Attendance</th><th>Score</th><th>Band</th><th>vs class avg</th><th></th></tr></thead>
              <tbody>
                {visible.map(({ s, r }) => {
                  const att = studentAttendancePct(s);
                  const diff = classAvg !== null && r.score !== null ? r.score - classAvg : null;
                  return (
                    <tr key={s.id} className="border-t hover:bg-accent/40">
                      <td className="py-2 pr-2">
                        <input type="checkbox" checked={compare.includes(s.id)} onChange={(e) => setCompare(e.target.checked ? [...compare.slice(-2), s.id] : compare.filter((x) => x !== s.id))} />
                      </td>
                      <td><Link to="/student/$id" params={{ id: s.id }} className="font-medium text-primary hover:underline">{s.name}</Link><div className="text-xs text-muted-foreground">{s.id} · {s.branch} Sem {s.semester}</div></td>
                      <td>{s.cgpa.toFixed(2)}</td>
                      <td>{att === null ? "—" : att.toFixed(1) + "%"}</td>
                      <td className="font-semibold">{r.score ?? "—"}</td>
                      <td><BandBadge score={r.score} /></td>
                      <td className={diff !== null && diff < 0 ? "text-destructive" : "text-success"}>{diff === null ? "—" : (diff > 0 ? "+" : "") + diff.toFixed(1)}</td>
                      <td><button onClick={() => setForm({ studentId: s.id, reason: "", action: "", priority: "medium", followUpDate: "2026-10-20" })} className="rounded-md border px-2 py-1 text-xs hover:bg-accent/60">Intervene</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {compareStudents.length >= 2 && (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <SectionTitle sub={`Class avg ${classAvg?.toFixed(1) ?? "—"} · median ${median ?? "—"}`}>Student comparison</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="py-1">Metric</th>{compareStudents.map((s) => <th key={s.id}>{s.name}</th>)}</tr></thead>
              <tbody>
                {([
                  ["Score", (s: typeof compareStudents[0]) => successScore(s).score ?? "—"],
                  ["CGPA", (s: typeof compareStudents[0]) => s.cgpa.toFixed(2)],
                  ["Attendance", (s: typeof compareStudents[0]) => { const a = studentAttendancePct(s); return a === null ? "—" : a.toFixed(1) + "%"; }],
                  ["Backlogs", (s: typeof compareStudents[0]) => s.backlogs],
                  ["Coding", (s: typeof compareStudents[0]) => s.skills.coding],
                  ["Aptitude", (s: typeof compareStudents[0]) => s.skills.aptitude],
                  ["Communication", (s: typeof compareStudents[0]) => s.skills.communication],
                  ["Best subject", (s: typeof compareStudents[0]) => s.subjects.length ? s.subjects.reduce((a, b) => (b.marks > a.marks ? b : a)).subject : "—"],
                  ["Weakest subject", (s: typeof compareStudents[0]) => s.subjects.length ? s.subjects.reduce((a, b) => (b.marks < a.marks ? b : a)).subject : "—"],
                ] as const).map(([label, fn]) => (
                  <tr key={label} className="border-t"><td className="py-2 text-muted-foreground">{label}</td>{compareStudents.map((s) => <td key={s.id} className="font-medium">{fn(s)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle>Cross-source insights (assigned students)</SectionTitle>
          {insights.length === 0 ? <EmptyState title="No active insights" /> : (
            <ul className="space-y-2 text-sm">
              {insights.map((i, k) => (
                <li key={k} className="rounded-lg border p-3">
                  <span className={`mr-2 inline-block h-2 w-2 rounded-full ${i.severity === "critical" ? "bg-destructive" : i.severity === "warning" ? "bg-warning" : "bg-info"}`} />
                  <b>{i.studentName}</b> — {i.type}
                  <p className="mt-1 text-muted-foreground">{i.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border bg-card p-4">
          <SectionTitle>Interventions</SectionTitle>
          {myInterventions.length === 0 ? <EmptyState title="No interventions yet" /> : (
            <ul className="space-y-2 text-sm">
              {myInterventions.map((i) => {
                const st = students.find((s) => s.id === i.studentId);
                return (
                  <li key={i.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <b>{st?.name ?? i.studentId}</b>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${i.status === "resolved" ? "bg-success/15 text-success" : i.status === "in-progress" ? "bg-info/15 text-info" : "bg-warning/15 text-warning"}`}>{i.status}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{i.reason} → {i.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Priority {i.priority} · Owner {i.owner} · Follow-up {i.followUpDate}</p>
                    {i.status !== "resolved" && (
                      <div className="mt-2 flex gap-2">
                        {i.status === "open" && <button onClick={() => updateInterventionStatus(i.id, "in-progress")} className="rounded border px-2 py-0.5 text-xs hover:bg-accent/60">Start</button>}
                        <button onClick={() => updateInterventionStatus(i.id, "resolved")} className="rounded border px-2 py-0.5 text-xs hover:bg-accent/60">Mark resolved</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/70 p-4" onClick={() => setForm(null)}>
          <div className="w-full max-w-md rounded-xl border bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold">New intervention — {students.find((s) => s.id === form.studentId)?.name}</h3>
            <div className="mt-3 space-y-3 text-sm">
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Reason (data-backed)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Action" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} />
              <div className="flex gap-2">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "medium" | "high" })} className="rounded-md border bg-card px-3 py-2">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
                <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="rounded-md border bg-background px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setForm(null)} className="rounded-md border px-3 py-1.5">Cancel</button>
                <button
                  disabled={!form.reason || !form.action}
                  onClick={() => {
                    addIntervention({ studentId: form.studentId, reason: form.reason, action: form.action, priority: form.priority, owner: MENTORS.find((m) => m.id === mentor)!.name, followUpDate: form.followUpDate, status: "open" });
                    setForm(null);
                  }}
                  className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground disabled:opacity-40"
                >Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
