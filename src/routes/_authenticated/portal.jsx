import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { pageHead } from "@/lib/metadata";
import { campusOptions } from "@/lib/use-campus";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () =>
    pageHead(
      "My Workspace",
      "Your authorized student records, scores and support plans, securely connected to your BIB InsightIQ account.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(campusOptions),
  component: () => (
    <PortalShell>
      <Outlet />
    </PortalShell>
  ),
});
