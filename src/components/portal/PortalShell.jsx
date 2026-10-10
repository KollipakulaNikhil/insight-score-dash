import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  Brain,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  FolderOpen,
  House,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  MessageSquare,
  Route as RouteIcon,
  ScrollText,
  Trophy,
  UserCheck,
  UserRound,
  Users,
  KeyRound,
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth.functions";
import { useAccount } from "@/lib/account";
import { useCampus } from "@/lib/use-campus";

// What each kind of person needs is different, so each gets its own menu.
export const NAV = {
  student: [
    { to: "/portal", label: "Home", icon: House, exact: true },
    { to: "/portal/profile", label: "Profile", icon: UserRound },
    { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/portal/learning", label: "Learning path", icon: RouteIcon },
    { to: "/portal/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/portal/lms", label: "LMS", icon: BookOpen },
    { to: "/portal/skills", label: "Skills", icon: Brain },
    { to: "/portal/placement", label: "Placement", icon: Briefcase },
    { to: "/portal/engagement", label: "Engagement", icon: Trophy },
    { to: "/portal/feedback", label: "Feedback", icon: MessageSquare },
  ],
  faculty: [
    { to: "/portal", label: "Home", icon: House, exact: true },
    { to: "/portal/students", label: "My students", icon: Users },
    { to: "/portal/interventions", label: "Interventions", icon: ClipboardList },
    { to: "/portal/monitor", label: "Attendance & risk", icon: Activity },
    { to: "/portal/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { to: "/portal", label: "Home", icon: House, exact: true },
    { to: "/portal/students", label: "All students", icon: Users },
    { to: "/portal/teachers", label: "Teachers", icon: UserCheck },
    { to: "/portal/assign", label: "Assign students", icon: Link2 },
    { to: "/portal/people", label: "People & roles", icon: KeyRound },
    { to: "/portal/records", label: "Student records", icon: FolderOpen },
    { to: "/portal/interventions", label: "Interventions", icon: ClipboardList },
    { to: "/portal/monitor", label: "Attendance & risk", icon: Activity },
    { to: "/portal/messages", label: "Messages", icon: Mail },
    { to: "/portal/audit", label: "Audit log", icon: ScrollText },
    { to: "/portal/profile", label: "Profile", icon: UserRound },
  ],
};
const ROLE_LABEL = { student: "Student", faculty: "Teacher", admin: "Administrator" };

export function PortalShell({ children }) {
  const { role, profile } = useCampus();
  const { refresh } = useAccount();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const items = NAV[role];
  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    await refresh();
    await navigate({ to: "/auth", replace: true });
  }
  return (
    <PublicLayout>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 rounded-xl border bg-card p-4">
            <p className="truncate font-semibold">{profile.display_name || profile.email}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {ROLE_LABEL[role]}
            </span>
          </div>
          <nav
            aria-label="Workspace"
            className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: Boolean(item.exact) }}
                className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-primary/10 font-medium !text-primary" }}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-start" onClick={logout}>
            <LogOut /> Sign out
          </Button>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </PublicLayout>
  );
}

/** Shows a page only to the roles it is meant for. The server enforces the real permissions. */
export function RoleGate({ allow, children }) {
  const { role } = useCampus();
  if (allow.includes(role)) return children;
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <p className="font-medium">This page is not part of your workspace.</p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/portal">Go to Home</Link>
      </Button>
    </div>
  );
}

export function PageTitle({ title, sub, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
