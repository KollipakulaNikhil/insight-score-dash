import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard, SectionTitle, BandBadge, ScoreRing, ProgressBar, EmptyState } from "@/components/widgets";
import { useAppState } from "@/lib/store";
import {
  successScore, studentAttendancePct, attendancePct, attendanceMarks, classesNeededForTarget,
  maxMissableClasses, lmsCompletion, pendingAssignments, checkEligibility, recommendations, crossSourceInsights,
} from "@/lib/scoring";
import { SEED_DRIVES } from "@/lib/seed";
import { DEFAULT_WEIGHTS } from "@/lib/types";
import { useState } from "react";

export const Route = createFileRoute("/student/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Student ${params.id} — BIB InsightIQ` },
      { name: "description", content: "Complete student profile: score, attendance, LMS, skills, placement, and engagement." },
      { property: "og:title", content: `Student ${params.id} — BIB InsightIQ` },
      { property: "og:description", content: "Complete student success profile." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentProfile,
});

const TABS = ["Overview", "Attendance", "LMS", "Placement", "Engagement & Feedback"] as const;
const LABELS: Record<string, string> = { academics: "Academics", attendance: "Attendance", lms: "LMS", engagement: "Engagement", skills: "Skills", placement: "Placement readiness" };

function StudentProfile() {
  const { id } = Route.useParams();
  const { students, interventions } = useAppState();
  const s = students.find((x) => x.id === id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  if (!s) {
    return (
      <Layout>
        <EmptyState title="Student not found" hint={`No record with ID ${id}.`} />
        <Link to="/student" className="mt-4 inline-block text-primary">← Back to students</Link>
      </Layout>
    );
  }

  const r = successScore(s);
  const att = studentAttendancePct(s);
  const lms = lmsCompletion(s);
  const pending = pendingAssignments(s);
  const recs = recommendations(s);
  const insights = crossSourceInsights([s]);
  const myInt = interventions.filter((i) => i.studentId === s.id);
  const totalHeld = s.subjects.reduce((a, x) => a + x.classesHeld, 0);
  const totalAtt = s.subjects.reduce((a, x) => a + x.classesAttended, 0);

  return (
    <Layout>
      <Link to="/student" className="text-sm text-muted-foreground hover:text-foreground">← All students</Link>
      <div className="mt-2 flex flex-wrap items-center gap-6 rounded-2xl border bg-card p-5">
        <ScoreRing score={r.score} />
        <div>
          <h1 className="font-display text-2xl font-bold">{s.name}</h1>
          <p className="text-sm text-muted-foreground">{s.id} · {s.branch} · Semester {s.semester} · Graduating {s.gradYear}</p>
          <div className="mt-2 flex items-center gap-2"><BandBadge score={r.score} /><span className="text-xs text-muted-foreground">Data completeness {r.completeness.toFixed(0)}%</span></div>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="CGPA" value={s.cgpa.toFixed(2)} />
          <StatCard label="Attendance" value={att === null ? "—" : att.toFixed(1) + "%"} tone={att !== null && att < 75 ? "danger" : "default"} />
          <StatCard label="LMS" value={lms === null ? "—" : lms.toFixed(0) + "%"} />
          <StatCard label="Backlogs" value={String(s.backlogs)} tone={s.backlogs ? "danger" : "success"} />
        </div>
      </div>

      {r.missing.length > 0 && (
        <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          Missing data: {r.missing.map((m) => LABELS[m]).join(", ")}. These components are excluded and remaining weights renormalized — not counted as zero.
        </div>
      )}

      <div className="mt-4 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <SectionTitle sub="Prototype weights — not official university policy">Score breakdown</SectionTitle>
              <div className="space-y-3">
                {Object.entries(r.components).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-sm"><span>{LABELS[k]} <span className="text-muted-foreground">({DEFAULT_WEIGHTS[k as keyof typeof DEFAULT_WEIGHTS]}%)</span></span><span className="font-medium">{v === null ? "missing" : v.toFixed(0)}</span></div>
                    <ProgressBar value={v ?? 0} tone={v === null ? "var(--muted)" : undefined} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-4">
                <SectionTitle>Contributing factors</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div><p className="mb-1 font-medium text-success">Positive</p>{r.positives.length ? r.positives.map((p) => <p key={p}>+ {p}</p>) : <p className="text-muted-foreground">—</p>}</div>
                  <div><p className="mb-1 font-medium text-destructive">Negative</p>{r.negatives.length ? r.negatives.map((p) => <p key={p}>− {p}</p>) : <p className="text-muted-foreground">—</p>}</div>
                </div>
              </div>
              {insights.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                  <SectionTitle>Cross-source risk insights</SectionTitle>
                  {insights.map((i, k) => <p key={k} className="mb-2 text-sm"><b>{i.type}:</b> <span className="text-muted-foreground">{i.detail}</span></p>)}
                </div>
              )}
              <div className="rounded-xl border bg-card p-4">
                <SectionTitle>Recommended actions</SectionTitle>
                <ul className="list-inside list-disc space-y-1 text-sm">{recs.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <SectionTitle>Interventions & progress</SectionTitle>
                {myInt.length === 0 ? <p className="text-sm text-muted-foreground">No interventions recorded.</p> : myInt.map((i) => (
                  <p key={i.id} className="text-sm">{i.action} — <b>{i.status}</b> <span className="text-muted-foreground">(follow-up {i.followUpDate}, {i.owner})</span></p>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 lg:col-span-2">
              <SectionTitle>Skills</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-5">
                {Object.entries(s.skills).map(([k, v]) => (
                  <div key={k}><div className="flex justify-between text-sm capitalize"><span>{k}</span><span>{v}</span></div><ProgressBar value={v} /></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Attendance" && (
          <div className="space-y-4">
            {totalHeld === 0 ? <EmptyState title="No attendance records" /> : (
              <div className="rounded-xl border bg-card p-4">
                <SectionTitle sub={`Overall ${totalAtt}/${totalHeld} classes · attendance marks: ${attendanceMarks(att)}/5`}>Attendance by subject</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-muted-foreground"><th className="py-1">Subject</th><th>Held</th><th>Attended</th><th>Missed</th><th>%</th><th>Marks</th><th>Need for 75/80/85/90%</th><th>Can miss (75%)</th></tr></thead>
                    <tbody>
                      {s.subjects.map((x) => {
                        const p = attendancePct(x.classesAttended, x.classesHeld)!;
                        return (
                          <tr key={x.subject} className="border-t">
                            <td className="py-2 font-medium">{x.subject}</td>
                            <td>{x.classesHeld}</td><td>{x.classesAttended}</td><td>{x.classesHeld - x.classesAttended}</td>
                            <td className={p < 75 ? "font-semibold text-destructive" : ""}>{p.toFixed(1)}%{p < 75 && " ⚠"}</td>
                            <td>{attendanceMarks(p)}</td>
                            <td>{[75, 80, 85, 90].map((t) => classesNeededForTarget(x.classesAttended, x.classesHeld, t)).join(" / ")}</td>
                            <td>{maxMissableClasses(x.classesAttended, x.classesHeld, 75)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Bands: ≥90% → 5 · 85–90 → 4 · 80–85 → 3 · 75–80 → 2 · &lt;75 → 0 (configurable prototype defaults).</p>
              </div>
            )}
          </div>
        )}

        {tab === "LMS" && (
          <div className="space-y-4">
            {s.lms.length === 0 ? <EmptyState title="No LMS data" hint="This student has no LMS records yet — not counted as zero." /> : (
              <>
                <div className="rounded-xl border bg-card p-4">
                  <SectionTitle>Pending assignments ({pending.length})</SectionTitle>
                  {pending.length === 0 ? <p className="text-sm text-success">All assignments submitted.</p> : (
                    <ul className="grid gap-2 text-sm sm:grid-cols-2">{pending.map((p) => <li key={p.subject + p.title} className="rounded-md border p-2">{p.subject} — {p.title}<span className="block text-xs text-muted-foreground">Due {p.deadline}</span></li>)}</ul>
                  )}
                </div>
                {s.lms.map((sub) => (
                  <details key={sub.subject} className="rounded-xl border bg-card p-4">
                    <summary className="cursor-pointer font-medium">{sub.subject} — {sub.units.filter((u) => u.assignment.submitted).length}/6 units done</summary>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {sub.units.map((u) => (
                        <div key={u.unit} className="rounded-lg border p-3 text-sm">
                          <p className="font-medium">Unit {u.unit}: {u.title.split(": ")[1]}</p>
                          {u.lessons.map((l) => <p key={l.title} className={l.completed ? "text-success" : "text-muted-foreground"}>{l.completed ? "✓" : "○"} {l.title}</p>)}
                          <p className="mt-1 text-xs text-muted-foreground">{u.lessons[0].resource}</p>
                          <p className="mt-2 text-xs">{u.assignment.title} · due {u.assignment.deadline} · {u.assignment.submitted ? `submitted (${u.assignment.marks}/20)` : "pending"}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "Placement" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Resume completeness" value={`${s.resumeCompleteness}%`} />
              <StatCard label="Assessments" value={`${s.assessmentsCompleted}/${s.assessmentsRequired || "—"}`} />
              <StatCard label="Target roles" value={s.targetRoles.join(", ") || "—"} />
            </div>
            {SEED_DRIVES.map((d) => {
              const e = checkEligibility(s, d);
              const match = s.targetRoles.includes(d.role);
              return (
                <div key={d.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{d.company} — {d.role} {match && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">role match</span>}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.eligible ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{e.eligible ? "Eligible" : "Not eligible"}</span>
                  </div>
                  <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                    {e.criteria.map((c) => (
                      <p key={c.label}><span className={c.result === "Pass" ? "text-success" : c.result === "Fail" ? "text-destructive" : "text-warning"}>{c.result}</span> · {c.label} <span className="text-muted-foreground">({c.detail})</span></p>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{e.explanation}</p>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Engagement & Feedback" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <SectionTitle sub="Only verified activities earn participation points">Engagement</SectionTitle>
              {s.engagement.length === 0 ? <p className="text-sm text-muted-foreground">No activities recorded.</p> : s.engagement.map((e) => (
                <div key={e.name} className="flex items-center justify-between border-t py-2 text-sm">
                  <span><span className="capitalize text-muted-foreground">{e.type}</span> · {e.name}</span>
                  <span className={e.verified ? "text-success" : "text-warning"}>{e.verified ? "Verified (+20)" : "Pending approval (0)"}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-card p-4">
              <SectionTitle>Feedback</SectionTitle>
              <p className="mb-1 text-xs uppercase text-muted-foreground">Faculty → student</p>
              {s.facultyFeedback.length ? s.facultyFeedback.map((f) => <p key={f.date} className="text-sm">“{f.note}” — {f.from}, {f.date}</p>) : <p className="text-sm text-muted-foreground">None</p>}
              <p className="mb-1 mt-3 text-xs uppercase text-muted-foreground">Student → class/faculty</p>
              {s.studentFeedback.length ? s.studentFeedback.map((f) => <p key={f.date} className="text-sm">{f.about}: “{f.note}”</p>) : <p className="text-sm text-muted-foreground">None</p>}
              <p className="mt-3 text-xs text-muted-foreground">Confidential complaints are not shown here — they are visible only to authorized reviewers.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
