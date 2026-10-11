import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_ROUTE } from "@/lib/portal-base";

// The administrator demonstration is the real administrator workspace, shown with fictional data.
export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    throw redirect({ to: DEMO_ROUTE, params: { _splat: "" }, search: { role: "admin" } });
  },
});
