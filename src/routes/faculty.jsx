import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_ROUTE } from "@/lib/portal-base";

// The teacher demonstration is the real teacher workspace, shown with fictional data.
export const Route = createFileRoute("/faculty")({
  beforeLoad: () => {
    throw redirect({ to: DEMO_ROUTE, params: { _splat: "" }, search: { role: "faculty" } });
  },
});
