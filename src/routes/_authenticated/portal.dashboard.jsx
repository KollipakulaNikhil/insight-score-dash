import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/portal/StudentPages";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/_authenticated/portal/dashboard")({
  head: () => pageHead("Dashboard", "Dashboard in your BIB InsightIQ workspace."),
  component: DashboardPage,
});
