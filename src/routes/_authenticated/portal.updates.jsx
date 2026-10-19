import { createFileRoute } from "@tanstack/react-router";
import { UpdatesPage } from "@/components/portal/UpdatesPage";
import { pageHead } from "@/lib/metadata";

export const Route = createFileRoute("/_authenticated/portal/updates")({
  head: () =>
    pageHead("Campus updates", "Placements, events, notices and posters from your university."),
  component: UpdatesPage,
});
