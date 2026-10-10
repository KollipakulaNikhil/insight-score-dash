import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { SectionTitle } from "@/components/widgets";
import { resetDemo, useAppState } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Hackathon Demo — BIB InsightIQ" },
      { name: "description", content: "Guided, repeatable demo scenario and pitch for BIB InsightIQ at HacXLerate." },
      { property: "og:title", content: "Hackathon Demo — BIB InsightIQ" },
      { property: "og:description", content: "Guided, repeatable demo scenario and pitch for BIB InsightIQ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Demo,
});

const DEMO_ID = "BIB-2026-002";

function Demo() {
  const { interventions } = useAppState();
  const created = interventions.some((i) => i.studentId === DEMO_ID);

  const steps: { t: string; d: string; link: React.ReactNode }[] = [
    { t: "Open a student's complete profile", d: "Priya Nair (fictional) — one ID linking every source.", link: <Link to="/student/$id" params={{ id: DEMO_ID }} className="text-primary hover:underline">Open profile →</Link> },
    { t: "Show integrated data", d: "Use the Attendance, LMS, and Placement tabs: academics, attendance, LMS, skills, placement together.", link: <Link to="/student/$id" params={{ id: DEMO_ID }} className="text-primary hover:underline">Profile tabs →</Link> },
    { t: "Demonstrate a cross-source risk insight", d: "CGPA 8.9 but attendance below 75%, and high CGPA with low placement readiness.", link: <Link to="/student/$id" params={{ id: DEMO_ID }} className="text-primary hover:underline">See insights →</Link> },
    { t: "Explain the Success Score", d: "Weighted 30/20/15/10/10/15 with renormalization for missing data and explainable factors.", link: <Link to="/student/$id" params={{ id: DEMO_ID }} className="text-primary hover:underline">Score breakdown →</Link> },
    { t: "Open the student from the faculty dashboard", d: "Dr. Rao's view: search 'Priya', compare with class average.", link: <Link to="/faculty" className="text-primary hover:underline">Faculty dashboard →</Link> },
    { t: "Create a mentor intervention", d: "Click Intervene on Priya — e.g. reason: attendance 71%, action: attendance plan + mock assessments.", link: <Link to="/faculty" className="text-primary hover:underline">Create →</Link> },
    { t: "Show the updated intervention status", d: created ? "Intervention exists — move it to in-progress / resolved." : "Waiting for step 6.", link: <Link to="/faculty" className="text-primary hover:underline">Interventions →</Link> },
    { t: "Return to the admin dashboard", d: "Aggregate KPIs, risk distribution and open intervention counts update from the same dataset.", link: <Link to="/admin" className="text-primary hover:underline">Admin →</Link> },
  ];

  return (
    <Layout allow={["admin"]}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Hackathon Demo</h1>
        <button onClick={() => { resetDemo(); location.reload(); }} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent/60">Reset demo data</button>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border bg-card p-5">
          <SectionTitle sub="Repeatable scenario — reset anytime">Demo walkthrough</SectionTitle>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === 6 && created ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground"}`}>
                  {i === 6 && created ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <div className="text-sm">
                  <p className="font-medium">{s.t}</p>
                  <p className="text-muted-foreground">{s.d}</p>
                  {s.link}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          {[
            ["The campus problem", "Student data lives in silos — grades, attendance, LMS, placement — so at-risk students are spotted too late."],
            ["Our solution", "BIB InsightIQ unifies every source under one student ID and turns it into an explainable Success Score and actions."],
            ["Integrated sources", "Academics, attendance, LMS, skills, engagement, placement, and feedback (7 sources)."],
            ["Scoring & risk", "Configurable rule-based score (not ML), four risk bands, missing data never treated as zero, academic and placement risk separated."],
            ["Actionable insights", "Cross-source patterns (e.g. high CGPA but low readiness) trigger mentor interventions with owner, priority, and follow-up."],
            ["Expected impact", "Earlier intervention, better attendance compliance, higher placement eligibility — measurable via intervention outcomes."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border bg-card p-4">
              <p className="font-display font-semibold text-primary">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
