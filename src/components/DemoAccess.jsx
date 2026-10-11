import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Users, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_STUDENT_ID, setDemoSession } from "@/lib/demo-session";
const OPTIONS = [
  {
    role: "student",
    label: "Student demo",
    email: "student@test.com",
    name: "Dev Reddy",
    icon: GraduationCap,
  },
  {
    role: "faculty",
    label: "Teacher demo",
    email: "faculty@test.com",
    name: "Dr. Rao",
    icon: Users,
  },
  {
    role: "admin",
    label: "Admin demo",
    email: "admin@test.com",
    name: "Campus Admin",
    icon: Building2,
  },
];
export function DemoAccess() {
  const navigate = useNavigate();
  const open = (o) => {
    if (o.role === "student") {
      setDemoSession({ role: "student", studentId: DEMO_STUDENT_ID, name: o.name });
      navigate({ to: "/demo-portal/$", params: { _splat: "" }, search: { role: "student" } });
    } else {
      setDemoSession({ role: o.role, name: o.name });
      navigate({ to: "/demo-portal/$", params: { _splat: "" }, search: { role: o.role } });
    }
  };
  return (
    <section aria-label="Test demo access" className="mx-auto mt-8 max-w-xl border-y py-6">
      <h2 className="text-center text-xl font-semibold">Try a test workspace</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Fictional records only · No password needed · Each role sees only its own pages
      </p>
      <div className="mt-5 grid gap-3">
        {OPTIONS.map((o) => (
          <Button
            key={o.role}
            variant="outline"
            className="h-auto justify-between py-3"
            onClick={() => open(o)}
          >
            <span className="flex items-center gap-3">
              <o.icon />
              <span className="text-left">
                {o.label}
                <span className="block text-xs text-muted-foreground">
                  {o.email} · Demo identity only
                </span>
              </span>
            </span>
            <ArrowRight />
          </Button>
        ))}
      </div>
    </section>
  );
}
