import { Link } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, Users, UserRound, Database, Presentation, RotateCcw } from "lucide-react";
import { resetDemo } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home", icon: GraduationCap },
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
  { to: "/faculty", label: "Faculty", icon: Users },
  { to: "/student", label: "Student", icon: UserRound },
  { to: "/data", label: "Data & Import", icon: Database },
  { to: "/demo", label: "Hackathon Demo", icon: Presentation },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
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
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60"
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => {
              resetDemo();
              location.reload();
            }}
            className="ml-auto flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/60"
            title="Reset all demo data"
          >
            <RotateCcw className="h-4 w-4" /> Reset demo
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} activeProps={{ className: "bg-accent text-accent-foreground" }} className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground">
              <n.icon className="h-3.5 w-3.5" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        BIB InsightIQ — TEAM BIB (Biryani Intelligence Bureau) · HacXLerate Smart Campus Analytics · Fictional demo data
      </footer>
    </div>
  );
}
