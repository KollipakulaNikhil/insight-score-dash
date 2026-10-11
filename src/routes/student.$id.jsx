import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEMO_ROUTE } from "@/lib/portal-base";

// A single student's page in the walkthrough, as an administrator sees it.
export const Route = createFileRoute("/student/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: DEMO_ROUTE,
      params: { _splat: `students/${encodeURIComponent(params.id)}` },
      search: { role: "admin" },
    });
  },
});
