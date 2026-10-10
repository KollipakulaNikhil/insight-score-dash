import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/widgets";
import { PageTitle, RoleGate } from "@/components/portal/PortalShell";
import { LearningPath } from "@/components/portal/LearningPath";
import {
  LiveEngagement,
  LiveFeedback,
  LiveLms,
  LivePlacement,
  LiveSkills,
  StudentHeader,
} from "@/components/student-profile/LiveStudentProfile";
import { Academics, Attendance, Overview } from "@/components/student-profile/shared";
import { liveNotifications } from "@/lib/live-profile";
import { useCampus } from "@/lib/use-campus";

/** Frame for the student-only pages: handles "no record linked yet" in one place. */
function StudentFrame({ title, sub, header = false, children }) {
  const { myRow } = useCampus();
  return (
    <RoleGate allow={["student"]}>
      <PageTitle title={title} sub={sub} />
      {!myRow ? (
        <div>
          <EmptyState
            title="No student record is linked to your account yet"
            hint="An administrator links your record and assigns your teacher. This page fills in once that is done."
          />
          <Button asChild variant="outline" className="mt-4">
            <Link to="/portal/profile">Complete my profile meanwhile</Link>
          </Button>
        </div>
      ) : (
        <>
          {header && <StudentHeader s={myRow.s} isOwner />}
          <div className={header ? "mt-4" : ""}>{children(myRow.s)}</div>
        </>
      )}
    </RoleGate>
  );
}

export function DashboardPage() {
  const { today } = useCampus();
  return (
    <StudentFrame title="Dashboard" sub="Your academic status" header>
      {(s) => (
        <div className="space-y-4">
          <Overview s={s} notes={liveNotifications(s, today)} />
          <Academics s={s} />
        </div>
      )}
    </StudentFrame>
  );
}

export function LearningPage() {
  return (
    <StudentFrame title="Learning path" sub="Your courses this semester and what to do next">
      {(s) => <LearningPath s={s} />}
    </StudentFrame>
  );
}

export function AttendancePage() {
  return (
    <StudentFrame title="Attendance" sub="Where you stand and how many classes you need">
      {(s) => <Attendance s={s} />}
    </StudentFrame>
  );
}

export function LmsPage() {
  return (
    <StudentFrame title="LMS" sub="Lessons and assignments">
      {(s) => <LiveLms s={s} />}
    </StudentFrame>
  );
}

export function SkillsPage() {
  return (
    <StudentFrame title="Skills" sub="Your assessment scores">
      {(s) => <LiveSkills s={s} />}
    </StudentFrame>
  );
}

export function PlacementPage() {
  return (
    <StudentFrame title="Placement" sub="Readiness and the roles you are aiming for">
      {(s) => <LivePlacement s={s} />}
    </StudentFrame>
  );
}

export function EngagementPage() {
  return (
    <StudentFrame title="Engagement" sub="Clubs, events, hackathons and certifications">
      {(s) => <LiveEngagement s={s} />}
    </StudentFrame>
  );
}

export function FeedbackPage() {
  const { refresh } = useCampus();
  return (
    <StudentFrame title="Feedback" sub="From your teachers, and what you tell us">
      {(s) => <LiveFeedback s={s} isOwner canWriteFaculty={false} onChanged={refresh} />}
    </StudentFrame>
  );
}
