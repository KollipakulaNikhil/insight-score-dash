import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_ROUTE } from "@/lib/portal-base";

// The student demonstration is the real student workspace, shown with fictional data.
export const Route = createFileRoute("/student/")({
  beforeLoad: () => {
    throw redirect({ to: DEMO_ROUTE, params: { _splat: "" }, search: { role: "student" } });
  },
});
