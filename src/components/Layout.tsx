import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, Users, UserRound, Database, Presentation, RotateCcw, LogOut, ShieldAlert } from "lucide-react";
import { resetDemo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { canOpen, setDemoSession, useDemoSession, type DemoRole } from "@/lib/demo-session";

const NAV: { to: string; label: string; icon: typeof GraduationCap; roles: DemoRole[] }[] = [
  { to: "/admin", label: "Admin", icon: LayoutDashboard, roles: ["admin"] },
  { to: "/faculty", label: "Faculty", icon: Users, roles: ["admin", "faculty"] },
  { to: "/student", label: "Students", icon: UserRound, roles: ["admin", "faculty"] },
  { to: "/data", label: "Data & Import", icon: Database, roles: ["admin"] },
  { to: "/demo", label: "Hackathon Demo", icon: Presentation, roles: ["admin"] },
];

export function Layout({ children, allow }: { children: React.ReactNode; allow?: DemoRole[] }) {
  const session = useDemoSession();
  const navigate = useNavigate();
  const items = session
    ? session.role === "student"
      ? [{ to: `/student/${session.studentId}`, label: "My Dashboard", icon: UserRound, roles: ["student"] as DemoRole[] }]
      : NAV.filter((n) => n.roles.includes(session.role))
    : [{ to: "/", label: "Home", icon: GraduationCap, roles: [] }, ...NAV];
  const allowed = canOpen(session, allow);

  const exit = () => {
    setDemoSession(null);
    navigate({ to: "/auth", replace: true });
  };

  const navLinks = (small: boolean) =>
    items.map((n) => (
      <Link
        key={n.to}
        to={n.to}
        activeOptions={{ exact: n.to === "/" }}
        activeProps={{ className: "bg-accent text-accent-foreground" }}
        className={small ? "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground" : "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60"}
      >
        <n.icon className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {n.label}
      </Link>
    ));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            BIB InsightIQ
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">{navLinks(false)}</nav>
          <div className="ml-auto flex items-center gap-2">
            {session && <span className="hidden text-xs text-muted-foreground sm:inline">Signed in as <b className="text-foreground">{session.name}</b> ({session.role})</span>}
            {(!session || session.role === "admin") && (
              <Button variant="outline" size="sm" onClick={() => { resetDemo(); location.reload(); }} title="Reset all demo data">
                <RotateCcw className="h-4 w-4" /> Reset demo
              </Button>
            )}
            {session && (
              <Button variant="outline" size="sm" onClick={exit}><LogOut className="h-4 w-4" /> Sign out</Button>
            )}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">{navLinks(true)}</nav>
      </header>
      <div className="border-b bg-warning/10 px-4 py-2 text-center text-xs text-warning">Fictional demo workspace · Changes stay in this browser · <Link to="/portal" className="underline">Open your private account</Link></div>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {allowed ? children : (
          <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-3 font-display text-xl font-bold">Access restricted</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your {session?.role} workspace cannot open this page. You can only see your own information.</p>
            {session?.role === "student" && (
              <Button asChild className="mt-5"><Link to="/student/$id" params={{ id: session.studentId ?? "" }}>Go to my dashboard</Link></Button>
            )}
          </div>
        )}
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        BIB InsightIQ — TEAM BIB (Biryani Intelligence Bureau) · HacXLerate Smart Campus Analytics · Fictional demo data
      </footer>
    </div>
  );
}
