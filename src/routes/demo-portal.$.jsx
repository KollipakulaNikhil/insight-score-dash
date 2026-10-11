import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { HomePage } from "@/components/portal/HomePages";
import { ProfilePage } from "@/components/portal/ProfilePage";
import {
  AssignPage,
  AuditPage,
  InterventionsPage,
  MessagesPage,
  MonitorPage,
  PeoplePage,
  RecordsPage,
  StudentDetailPage,
  StudentsPage,
  TeachersPage,
} from "@/components/portal/StaffPages";
import {
  AttendancePage,
  DashboardPage,
  EngagementPage,
  FeedbackPage,
  LearningPage,
  LmsPage,
  PlacementPage,
  SkillsPage,
} from "@/components/portal/StudentPages";
import { DEMO_ROLES, demoCampusOptions } from "@/lib/demo-campus";
import { pageHead } from "@/lib/metadata";
import { DEMO_ROUTE, PortalModeContext } from "@/lib/portal-base";

// A read-only walkthrough of the real workspace pages, filled with fictional data held in the
// browser. It is a separate route tree from /portal: it never calls the signed-in server
// functions and never grants access to anything.
const PAGES = {
  "": HomePage,
  profile: ProfilePage,
  dashboard: DashboardPage,
  learning: LearningPage,
  attendance: AttendancePage,
  lms: LmsPage,
  skills: SkillsPage,
  placement: PlacementPage,
  engagement: EngagementPage,
  feedback: FeedbackPage,
  students: StudentsPage,
  interventions: InterventionsPage,
  monitor: MonitorPage,
  teachers: TeachersPage,
  assign: AssignPage,
  people: PeoplePage,
  records: RecordsPage,
  messages: MessagesPage,
  audit: AuditPage,
};

const ROLE_LABEL = { student: "Student", faculty: "Teacher", admin: "Administrator" };

export const Route = createFileRoute("/demo-portal/$")({
  ssr: false,
  validateSearch: (search) => ({
    role: DEMO_ROLES.includes(search.role) ? search.role : "admin",
  }),
  loaderDeps: ({ search }) => ({ role: search.role }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(demoCampusOptions(deps.role)),
  head: () =>
    pageHead(
      "Workspace walkthrough",
      "A read-only walkthrough of the BIB InsightIQ student, teacher and administrator workspaces using fictional data.",
    ),
  component: DemoPortal,
});

function DemoBanner({ role }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed bg-muted/40 p-3 text-sm">
      <p>
        <span className="font-semibold">Demonstration.</span> The same pages as the real workspace,
        with fictional data. Changes are not saved.
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground">View as</span>
        {DEMO_ROLES.map((r) => (
          <Link
            key={r}
            to={DEMO_ROUTE}
            params={{ _splat: "" }}
            search={{ role: r }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              r === role ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
            }`}
          >
            {ROLE_LABEL[r]}
          </Link>
        ))}
        <Link to="/auth" className="ml-1 text-xs text-primary underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <p className="font-medium">This page is not part of the walkthrough.</p>
    </div>
  );
}

function DemoPortal() {
  const { role } = Route.useSearch();
  const splat = Route.useParams()._splat ?? "";
  const [head = "", id] = splat.split("/");
  const Page = PAGES[head];
  let page = <NotFound />;
  if (head === "students" && id) page = <StudentDetailPage id={decodeURIComponent(id)} />;
  else if (Page) page = <Page />;
  return (
    <PortalModeContext.Provider value={{ demo: true, role }}>
      <PortalShell>
        <DemoBanner role={role} />
        {page}
      </PortalShell>
    </PortalModeContext.Provider>
  );
}
