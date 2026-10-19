import { createFileRoute } from "@tanstack/react-router";
import { PeoplePage } from "@/components/portal/StaffPages";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/_authenticated/portal/people")({
  head: () => pageHead("People & roles", "People & roles in your Orbit workspace."),
  component: PeoplePage,
});
