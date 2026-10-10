import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { BandBadge, SectionTitle } from "@/components/widgets";
import { useAppState } from "@/lib/store";
import { successScore } from "@/lib/scoring";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboards — BIB InsightIQ" },
      { name: "description", content: "Pick a student to view their personal success dashboard." },
      { property: "og:title", content: "Student Dashboards — BIB InsightIQ" },
      { property: "og:description", content: "Pick a student to view their personal success dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentPicker,
});

function StudentPicker() {
  const { students } = useAppState();
  return (
    <Layout>
      <h1 className="mb-1 font-display text-2xl font-bold">Student Dashboard</h1>
      <SectionTitle sub="Demo mode: choose which fictional student to sign in as">Select a student</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {students.map((s) => {
          const r = successScore(s);
          return (
            <Link key={s.id} to="/student/$id" params={{ id: s.id }} className="rounded-xl border bg-card p-4 transition-colors hover:border-primary">
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.id} · {s.branch} Sem {s.semester}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-xl font-bold">{r.score ?? "—"}</span>
                <BandBadge score={r.score} />
              </div>
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}
