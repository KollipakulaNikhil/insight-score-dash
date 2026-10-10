import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Briefcase,
  Brain,
  Trophy,
  MessageSquare,
  LayoutGrid,
  PlayCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flag,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layout } from "@/components/Layout";
import {
  FlagBadge,
  Overview,
  Academics,
  Attendance,
  LABELS,
  card,
} from "@/components/student-profile/shared";
import {
  StatCard,
  SectionTitle,
  BandBadge,
  ScoreRing,
  ProgressBar,
  EmptyState,
} from "@/components/widgets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComplaint, useAppState } from "@/lib/store";
import {
  successScore,
  studentAttendancePct,
  lmsCompletion,
  checkEligibility,
  recommendations,
  crossSourceInsights,
} from "@/lib/scoring";
import { academicRisk, placementRisk, effectiveBand } from "@/lib/risk-flags";
import { SEED_DRIVES } from "@/lib/seed";
import { DEFAULT_WEIGHTS } from "@/lib/types";
import { useDemoSession } from "@/lib/demo-session";
import {
  attendancePlan,
  unitContent,
  assignmentBoard,
  loginFrequency,
  weeklyTests,
  VOCAB,
  PRACTICE_SETS,
  resumeCheck,
  mockInterviews,
  upcomingDrives,
  drivesAllowedByCgpa,
  CLUBS,
  EVENTS,
  HACKATHONS,
  integrityFlags,
  engagementScore,
  feedbackRounds,
  segmentOf,
  notifications,
  daysUntil,
  REMAINING_CLASSES_PER_SUBJECT,
} from "@/lib/student-extras";
export const Route = createFileRoute("/student/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Student ${params.id} — BIB InsightIQ` },
      {
        name: "description",
        content:
          "Personal student dashboard: academics, attendance, LMS, skills, placement, engagement and feedback.",
      },
      { property: "og:title", content: `Student ${params.id} — BIB InsightIQ` },
      {
        property: "og:description",
        content: "Personal student success dashboard with alerts and improvement tips.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentProfile,
});
const TABS = [
  { k: "Overview", icon: LayoutGrid },
  { k: "Academics", icon: GraduationCap },
  { k: "Attendance", icon: CalendarCheck },
  { k: "LMS", icon: BookOpen },
  { k: "Skills", icon: Brain },
  { k: "Placement", icon: Briefcase },
  { k: "Engagement", icon: Trophy },
  { k: "Feedback", icon: MessageSquare },
];
function StudentProfile() {
  const { id } = Route.useParams();
  const session = useDemoSession();
  const { students } = useAppState();
  const s = students.find((x) => x.id === id);
  const [tab, setTab] = useState("Overview");
  const ownOnly = session?.role === "student" && session.studentId !== id;
  if (ownOnly) return <Layout allow={[]}>{null}</Layout>;
  if (!s)
    return (
      <Layout>
        <EmptyState title="Student not found" hint={`No record with ID ${id}.`} />
      </Layout>
    );
  const r = successScore(s);
  const att = studentAttendancePct(s);
  const lms = lmsCompletion(s);
  const notes = notifications(s);
  const seg = segmentOf(s);
  const isStudent = session?.role === "student";
  const acad = academicRisk(s);
  const place = placementRisk(s);
  const band = effectiveBand(r.score, r.band, acad, place);
  return (
    <Layout allow={["student", "faculty", "admin"]}>
      {!isStudent && (
        <Link to="/student" className="text-sm text-muted-foreground hover:text-foreground">
          ← All students
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-6 rounded-2xl border bg-card p-5">
        <ScoreRing score={r.score} />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {isStudent ? "Welcome back" : "Student profile"}
          </p>
          <h1 className="font-display text-2xl font-bold">{s.name}</h1>
          <p className="text-sm text-muted-foreground">
            {s.id} · {s.branch} · Semester {s.semester} · Graduating {s.gradYear}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {band === r.band ? (
              <BandBadge score={r.score} />
            ) : (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                {band} (lowered by High risk flag)
              </span>
            )}
            <FlagBadge label="Academic risk" flag={acad} />
            <FlagBadge label="Placement risk" flag={place} />
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              Segment: {seg.name}
            </span>
          </div>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="CGPA" value={s.cgpa.toFixed(2)} />
          <StatCard
            label="Attendance"
            value={att === null ? "—" : att.toFixed(1) + "%"}
            tone={att !== null && att < 75 ? "danger" : "default"}
          />
          <StatCard label="LMS" value={lms === null ? "—" : lms.toFixed(0) + "%"} />
          <StatCard
            label="Alerts"
            value={String(notes.filter((n) => n.tone !== "info").length)}
            tone={notes.some((n) => n.tone === "danger") ? "danger" : "warning"}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm ${tab === t.k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="h-4 w-4" />
            {t.k}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Overview" && <Overview s={s} notes={notes} />}
        {tab === "Academics" && <Academics s={s} />}
        {tab === "Attendance" && <Attendance s={s} />}
        {tab === "LMS" && <Lms s={s} />}
        {tab === "Skills" && <Skills s={s} />}
        {tab === "Placement" && <Placement s={s} />}
        {tab === "Engagement" && <Engagement s={s} />}
        {tab === "Feedback" && <Feedback s={s} canFile={isStudent || !session} />}
      </div>
    </Layout>
  );
}
function Lms({ s }) {
  const board = assignmentBoard(s);
  const [submitted, setSubmitted] = useState([]);
  const freq = loginFrequency(s);
  if (!s.lms.length) return <EmptyState title="No LMS data" hint="Not counted as zero." />;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} lg:col-span-2`}>
          <SectionTitle sub="Task, given date, last date and reminders before closing">
            Assignments
          </SectionTitle>
          <div className="space-y-2">
            {board.map((a) => {
              const key = a.subject + a.title;
              const done = submitted.includes(key);
              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {a.title} <span className="text-muted-foreground">· {a.subject}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Task: {a.task}</p>
                    <p className="text-xs">
                      Given {a.given} · Last date {a.due}{" "}
                      {!done && a.daysLeft <= 3 && (
                        <span className="ml-1 rounded bg-warning/15 px-1.5 text-warning">
                          Closing in {a.daysLeft} day(s)
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    disabled={done}
                    onClick={() => setSubmitted([...submitted, key])}
                  >
                    {done ? "Submitted ✓" : "Submit"}
                  </Button>
                </div>
              );
            })}
            {!board.length && <p className="text-sm text-success">No pending assignments.</p>}
          </div>
        </div>
        <div className={card}>
          <SectionTitle sub="Logins in the last 7 days">Login frequency</SectionTitle>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={freq}>
                <XAxis dataKey="day" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="logins" fill="var(--primary)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground">
            Total {freq.reduce((a, x) => a + x.logins, 0)} logins · aim for at least one per day.
          </p>
        </div>
      </div>
      {s.lms.map((sub) => (
        <details key={sub.subject} className={card}>
          <summary className="cursor-pointer font-medium">
            {sub.subject} — {sub.units.filter((u) => u.assignment.submitted).length}/6 units
            complete
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sub.units.map((u) => {
              const c = unitContent(sub.subject, u.unit, u.assignment.submitted);
              return (
                <div key={u.unit} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">
                    Unit {u.unit}: {u.title.split(": ")[1]}
                  </p>
                  <p className="mt-1 text-xs uppercase text-muted-foreground">Syllabus</p>
                  <ul className="list-inside list-disc text-xs">
                    {c.syllabus.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs uppercase text-muted-foreground">Reference videos</p>
                  {c.videos.map((v) => (
                    <p
                      key={v.title}
                      className={`flex items-center gap-1 text-xs ${v.watched ? "text-success" : ""}`}
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      {v.title} · {v.minutes} min
                    </p>
                  ))}
                  <p className="mt-2 text-xs uppercase text-muted-foreground">
                    Uploaded by teacher
                  </p>
                  {c.teacherUploads.map((t) => (
                    <p key={t.title} className="text-xs">
                      📄 {t.title} <span className="text-muted-foreground">({t.date})</span>
                    </p>
                  ))}
                  <p className="mt-2 text-xs">
                    {u.assignment.submitted
                      ? `✓ Assignment marks ${u.assignment.marks}/20`
                      : "○ Assignment pending"}
                  </p>
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
function Skills({ s }) {
  const tests = weeklyTests(s);
  const tech = [
    { k: "Coding", v: s.skills.coding },
    { k: "Analytical", v: s.skills.analytical },
  ];
  const soft = [
    { k: "Verbal", v: s.skills.verbal },
    { k: "Aptitude", v: s.skills.aptitude },
    { k: "Communication", v: s.skills.communication },
  ];
  const block = (title, items) => (
    <div className={card}>
      <SectionTitle>{title}</SectionTitle>
      {items.map((x) => (
        <div key={x.k} className="mb-3">
          <div className="flex justify-between text-sm">
            <span>{x.k}</span>
            <span className={x.v < 60 ? "text-destructive" : ""}>{x.v}</span>
          </div>
          <ProgressBar value={x.v} />
        </div>
      ))}
    </div>
  );
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {block("Technical assessment", tech)}
      {block("Soft-skill assessment", soft)}
      <div className={`${card} lg:col-span-2`}>
        <SectionTitle sub="Weekly verbal, aptitude and analytical tests">
          Weekly test progress
        </SectionTitle>
        <div className="h-60">
          <ResponsiveContainer>
            <LineChart data={tests}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip />
              <Line dataKey="aptitude" stroke="var(--primary)" />
              <Line dataKey="verbal" stroke="var(--warning)" />
              <Line dataKey="analytical" stroke="var(--success)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className={card}>
        <SectionTitle sub="Build vocabulary every day">Word of the week</SectionTitle>
        {VOCAB.map((v) => (
          <p key={v.word} className="border-t py-2 text-sm">
            <b>{v.word}</b> — <span className="text-muted-foreground">{v.meaning}</span>
          </p>
        ))}
      </div>
      <div className={card}>
        <SectionTitle sub="Aptitude and verbal practice assessments">Practice sets</SectionTitle>
        {PRACTICE_SETS.map((p) => (
          <div key={p.name} className="flex items-center justify-between border-t py-2 text-sm">
            <span>
              {p.name}
              <span className="block text-xs text-muted-foreground">
                {p.questions} questions · {p.minutes} min
              </span>
            </span>
            <Button size="sm" variant="outline">
              Start
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
function Placement({ s }) {
  const cv = resumeCheck(s);
  const quota = drivesAllowedByCgpa(s.cgpa);
  const mocks = mockInterviews(s);
  const pr = successScore(s).components.placement;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Placement score" value={pr === null ? "—" : pr.toFixed(0)} />
        <StatCard label="Aptitude" value={String(s.skills.aptitude)} />
        <StatCard label="Coding" value={String(s.skills.coding)} />
        <StatCard
          label="Mock avg"
          value={String(Math.round(mocks.reduce((a, m) => a + m.score, 0) / mocks.length))}
        />
        <StatCard label="Drives allowed" value={quota.limit} sub={quota.note} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <SectionTitle sub={`Selected role: ${cv.role}`}>Resume check</SectionTitle>
          <p className={`text-sm font-medium ${cv.matches ? "text-success" : "text-warning"}`}>
            {cv.matches
              ? "Resume matches your target role"
              : "Resume does not yet match your target role"}{" "}
            · {cv.match}% skill match · {s.resumeCompleteness}% complete
          </p>
          <p className="mt-2 text-sm">Found: {cv.found.join(", ") || "—"}</p>
          <p className="text-sm text-destructive">Missing: {cv.missing.join(", ") || "—"}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Where to improve: add projects and certifications that show the missing skills.
          </p>
        </div>
        <div className={card}>
          <SectionTitle sub="Past mock interview results">Mock interviews</SectionTitle>
          {mocks.map((m) => (
            <div key={m.date} className="border-t py-2 text-sm">
              <div className="flex justify-between">
                <span>
                  {m.type} · {m.date}
                </span>
                <b>{m.score}/100</b>
              </div>
              <p className="text-xs text-muted-foreground">Feedback: {m.note}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={card}>
        <SectionTitle sub="You'll get notified before each drive">Upcoming drives</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-3">
          {upcomingDrives().map((d) => (
            <div key={d.company} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{d.company}</p>
              <p className="text-xs text-muted-foreground">
                {d.role} · {d.date}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                <Bell className="h-3 w-3" /> in {daysUntil(d.date)} days
              </p>
            </div>
          ))}
        </div>
      </div>
      {SEED_DRIVES.map((d) => {
        const e = checkEligibility(s, d);
        return (
          <div key={d.id} className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {d.company} — {d.role}
                {s.targetRoles.includes(d.role) && (
                  <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                    role match
                  </span>
                )}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.eligible ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
              >
                {e.eligible ? "Eligible" : "Not eligible"}
              </span>
            </div>
            <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {e.criteria.map((c) => (
                <p key={c.label}>
                  <span
                    className={
                      c.result === "Pass"
                        ? "text-success"
                        : c.result === "Fail"
                          ? "text-destructive"
                          : "text-warning"
                    }
                  >
                    {c.result}
                  </span>{" "}
                  · {c.label} <span className="text-muted-foreground">({c.detail})</span>
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{e.explanation}</p>
          </div>
        );
      })}
    </div>
  );
}
function Engagement({ s }) {
  const flags = integrityFlags(s);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Engagement score"
          value={`${engagementScore(s)} / 100`}
          sub="Verified activities only"
        />
        <StatCard label="Activities" value={String(s.engagement.length)} />
        <StatCard
          label="Integrity flags"
          value={String(flags.length)}
          tone={flags.length ? "warning" : "success"}
        />
      </div>
      {flags.length > 0 && (
        <div className={card}>
          <SectionTitle>Misconduct & fraud check</SectionTitle>
          {flags.map((f) => (
            <p key={f.detail} className="flex gap-2 text-sm text-warning">
              <Flag className="h-4 w-4" />
              <b>{f.kind}:</b> {f.detail}
            </p>
          ))}
        </div>
      )}
      <div className={card}>
        <SectionTitle>Your activities</SectionTitle>
        {s.engagement.length ? (
          s.engagement.map((e) => (
            <div key={e.name} className="flex justify-between border-t py-2 text-sm">
              <span>
                <span className="capitalize text-muted-foreground">{e.type}</span> · {e.name}
              </span>
              <span className={e.verified ? "text-success" : "text-warning"}>
                {e.verified ? "Verified" : "Pending evidence"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No activities yet — join a club below.</p>
        )}
      </div>
      <div className={card}>
        <SectionTitle sub={`${CLUBS.length} clubs on campus`}>Clubs — why join</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {CLUBS.map((c) => (
            <div key={c.name} className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <b>{c.name}</b>
                <span className="text-primary">Club score {c.score}</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.members} members</p>
              <p className="mt-1">Benefit: {c.why}</p>
              <p className="text-muted-foreground">Importance: {c.importance}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <SectionTitle>Events happening</SectionTitle>
          {EVENTS.map((e) => (
            <div key={e.name} className="border-t py-2 text-sm">
              <b>{e.name}</b>{" "}
              <span className="text-xs text-muted-foreground">
                · {e.kind} · {e.date}
              </span>
              <p className="text-muted-foreground">{e.about}</p>
            </div>
          ))}
        </div>
        <div className={card}>
          <SectionTitle>Hackathons</SectionTitle>
          {HACKATHONS.map((h) => (
            <div key={h.name} className="border-t py-2 text-sm">
              <b>{h.name}</b> <span className="text-xs text-muted-foreground">· {h.date}</span>
              <p>{h.brief}</p>
              <p className="text-muted-foreground">Why participate: {h.why}</p>
              <p className="text-muted-foreground">How it's different: {h.different}</p>
              <p className="text-muted-foreground">Best part: {h.best}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Feedback({ s, canFile }) {
  const rounds = feedbackRounds(s);
  const [given, setGiven] = useState({});
  const [draft, setDraft] = useState({});
  const [complaint, setComplaint] = useState("");
  const [filed, setFiled] = useState(false);
  return (
    <div className="space-y-4">
      <div className={card}>
        <SectionTitle sub="Each teacher reviews you three times every semester">
          Faculty feedback on you
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {rounds.map((r) => (
            <div key={r.subject} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">
                {r.subject} · {r.teacher}
              </p>
              {r.rounds.map((x) => (
                <p key={x.round} className={x.done ? "" : "text-muted-foreground"}>
                  Round {x.round} ({x.date}): {x.remark}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
      {canFile && (
        <div className={card}>
          <SectionTitle sub="Give feedback after every class — how it went and what can improve">
            Rate your classes
          </SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {rounds.map((r) => {
              const g = given[r.subject];
              return (
                <div key={r.subject} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">
                    {r.subject} · {r.teacher}
                  </p>
                  {g ? (
                    <p className="mt-2 text-success">
                      Thanks! You rated {g.rating}/5 — "{g.remark}"
                    </p>
                  ) : (
                    <>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Button
                            key={n}
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setGiven({
                                ...given,
                                [r.subject]: {
                                  rating: n,
                                  remark: draft[r.subject] || "No remarks",
                                },
                              })
                            }
                          >
                            {n}★
                          </Button>
                        ))}
                      </div>
                      <Textarea
                        className="mt-2"
                        placeholder="What was good? What needs to improve?"
                        maxLength={300}
                        value={draft[r.subject] ?? ""}
                        onChange={(e) => setDraft({ ...draft, [r.subject]: e.target.value })}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {canFile && (
        <div className={card}>
          <SectionTitle sub="Confidential — only authorized reviewers can read it">
            File a complaint
          </SectionTitle>
          <p className="mb-2 text-sm text-muted-foreground">
            Report disturbance in class, decorum not followed, or harassment.
          </p>
          {filed ? (
            <p className="text-sm text-success">
              Complaint filed confidentially. A reviewer will follow up.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (complaint.trim().length < 10) return;
                addComplaint(s.id, complaint.trim());
                setFiled(true);
              }}
            >
              <Textarea
                required
                minLength={10}
                maxLength={1000}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe what happened (at least 10 characters)"
              />
              <Button className="mt-2" type="submit">
                Submit complaint
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
