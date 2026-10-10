import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard, SectionTitle } from "@/components/widgets";
import { useAppState } from "@/lib/store";
import { successScore, crossSourceInsights } from "@/lib/scoring";
import { ArrowRight, Database, Gauge, LayoutDashboard, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BIB InsightIQ — Student Success Intelligence Platform" },
      { name: "description", content: "Unified student data, success scoring, and risk insights for smart campuses. HacXLerate demo by TEAM BIB." },
      { property: "og:title", content: "BIB InsightIQ — Student Success Intelligence Platform" },
      { property: "og:description", content: "Unified student data, success scoring, and risk insights for smart campuses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { students } = useAppState();
  const scores = students.map((s) => successScore(s).score).filter((x): x is number => x !== null);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
  const insights = crossSourceInsights(students);

  return (
    <Layout>
      <section className="rounded-2xl border bg-gradient-to-br from-card to-accent/30 p-8 md:p-12">
        <p className="text-sm font-medium text-primary">HacXLerate · Smart Campus Analytics · TEAM BIB (Biryani Intelligence Bureau)</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold md:text-5xl">
          Student Success Intelligence, unified in one platform
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Academics, attendance, LMS, skills, engagement, and placement data connected by a single student ID — scored, explained, and turned into action.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/demo" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Run the hackathon demo <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-accent/60">
            Admin dashboard
          </Link>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students tracked" value={String(students.length)} sub="fictional demo cohort" />
        <StatCard label="Avg success score" value={avg} sub="out of 100" />
        <StatCard label="Active cross-source insights" value={String(insights.length)} tone={insights.length ? "warning" : "success"} />
        <StatCard label="Data sources unified" value="7" sub="academics → feedback" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Database, t: "Unified data", d: "One student ID connects academics, attendance, LMS, skills, engagement, placement, and feedback." },
          { icon: Gauge, t: "Success Score", d: "Configurable 100-point score with risk bands and explainable contributing factors." },
          { icon: LayoutDashboard, t: "Three dashboards", d: "Student, faculty, and administrator views — all derived from the same dataset." },
          { icon: ShieldCheck, t: "Responsible by design", d: "Missing data is never zero, unverified claims earn no points, complaints need human review." },
        ].map((f) => (
          <div key={f.t} className="rounded-xl border bg-card p-5">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SectionTitle sub="Live signals from the current demo dataset">Recent cross-source insights</SectionTitle>
        <div className="space-y-2">
          {insights.slice(0, 5).map((i, k) => (
            <div key={k} className="flex items-start gap-3 rounded-lg border bg-card p-3 text-sm">
              <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${i.severity === "critical" ? "bg-destructive" : i.severity === "warning" ? "bg-warning" : "bg-info"}`} />
              <div>
                <span className="font-medium">{i.studentName}</span> — {i.type}
                <p className="text-muted-foreground">{i.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
