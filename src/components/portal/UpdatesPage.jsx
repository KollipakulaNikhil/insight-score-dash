import { useState } from "react";
import { PageTitle } from "@/components/portal/PortalShell";
import { CATEGORY, PostUpdate, UpdatesFeed } from "@/components/portal/CampusUpdates";
import { useCampus } from "@/lib/use-campus";

export function UpdatesPage() {
  const { role } = useCampus();
  const [cat, setCat] = useState("all");
  return (
    <div>
      <PageTitle
        title="Campus updates"
        sub="Placements, events, notices and posters from the university"
      >
        {role !== "student" && <PostUpdate />}
      </PageTitle>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter updates">
        {[["all", "All"], ...Object.entries(CATEGORY).map(([k, c]) => [k, c.label + "s"])].map(
          ([key, text]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={cat === key}
              onClick={() => setCat(key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                cat === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {text}
            </button>
          ),
        )}
      </div>
      <UpdatesFeed categories={cat === "all" ? undefined : [cat]} />
    </div>
  );
}
