import { queryOptions } from "@tanstack/react-query";
import { SEED_STUDENTS } from "@/lib/seed-students";

// Fictional data in the same shape as the signed-in campus query (loadCampus), so the walkthrough
// can render the real portal pages. Nothing here is real and nothing here grants access.

export const DEMO_ROLES = ["student", "faculty", "admin"];
export const DEMO_STUDENT_ID = "BIB-2026-005";
const MENTOR = { id: "FAC-01", name: "Dr. Rao", email: "dr.rao@demo.example" };
const CREATED = "2026-08-01T09:00:00.000Z";

const ownerId = (s) => `demo-${s.id}`;
const emailOf = (s) => `${s.name.toLowerCase().replace(/[^a-z]+/g, ".")}@demo.example`;

const toRecord = (s) => ({
  id: s.id,
  owner_id: ownerId(s),
  faculty_id: MENTOR.id,
  // The seed marks a missing CGPA as -1; the workspace stores "not recorded" as 0.
  record: { ...s, cgpa: Math.max(0, s.cgpa) },
  updated_at: CREATED,
  owner_email: emailOf(s),
  owner_name: s.name,
  mentor_email: MENTOR.email,
  mentor_name: MENTOR.name,
});

const intervention = (
  n,
  studentId,
  reason,
  action,
  priority,
  status,
  followUpDate,
  outcome = "",
) => ({
  id: `00000000-0000-4000-8000-00000000000${n}`,
  student_id: studentId,
  created_by: MENTOR.id,
  reason,
  action,
  priority,
  owner: MENTOR.name,
  follow_up_date: followUpDate,
  status,
  outcome,
  created_at: `2026-09-2${n}T10:00:00.000Z`,
});

const INTERVENTIONS = [
  intervention(
    1,
    "BIB-2026-005",
    "Placement readiness is medium and attendance is close to the 75% limit",
    "Weekly mentoring, mock interview and aptitude practice plan",
    "high",
    "in-progress",
    "2026-10-17",
  ),
  intervention(
    2,
    "BIB-2026-003",
    "SGPA fell compared with the previous semester",
    "Doubt sessions and a revision plan for the weakest units",
    "medium",
    "open",
    "2026-10-24",
  ),
  intervention(
    3,
    "BIB-2026-008",
    "Low attendance in two subjects",
    "Attendance contract and class-wise reminders",
    "medium",
    "resolved",
    "2026-10-05",
    "Attendance back above 80% after three weeks.",
  ),
];

export function buildDemoCampus(role) {
  const student = SEED_STUDENTS.find((s) => s.id === DEMO_STUDENT_ID) ?? SEED_STUDENTS[0];
  const me =
    role === "admin"
      ? { id: "demo-admin", name: "Demo Administrator", email: "admin@demo.example" }
      : role === "faculty"
        ? { id: MENTOR.id, name: MENTOR.name, email: MENTOR.email }
        : { id: ownerId(student), name: student.name, email: emailOf(student) };
  const records = (role === "student" ? [student] : SEED_STUDENTS).map(toRecord);
  const visible = new Set(records.map((r) => r.id));
  return {
    profile: {
      id: me.id,
      email: me.email,
      display_name: me.name,
      phone: "",
      address: "",
      bio: "",
      linkedin_url: "",
      github_url: "",
      created_at: CREATED,
    },
    roles: [{ role }],
    records,
    interventions: INTERVENTIONS.filter((i) => visible.has(i.student_id)),
  };
}

export const demoCampusOptions = (role) =>
  queryOptions({
    queryKey: ["demo-campus", role],
    queryFn: async () => buildDemoCampus(role),
    staleTime: Infinity,
  });

export const demoAccounts = async () => [
  { id: "demo-admin", email: "admin@demo.example", name: "Demo Administrator", roles: ["admin"] },
  { id: MENTOR.id, email: MENTOR.email, name: MENTOR.name, roles: ["faculty"] },
  ...SEED_STUDENTS.slice(0, 12).map((s) => ({
    id: ownerId(s),
    email: emailOf(s),
    name: s.name,
    roles: ["student"],
  })),
];

export const demoAudit = async () => [
  {
    id: "a1",
    operation: "LINK",
    record_id: "BIB-2026-005",
    created_at: "2026-09-28T11:00:00.000Z",
    actor_email: "admin@demo.example",
  },
  {
    id: "a2",
    operation: "UPDATE",
    record_id: "BIB-2026-003",
    created_at: "2026-09-27T15:30:00.000Z",
    actor_email: "admin@demo.example",
  },
  {
    id: "a3",
    operation: "NOTE",
    record_id: "BIB-2026-008",
    created_at: "2026-09-26T09:10:00.000Z",
    actor_email: MENTOR.email,
  },
  {
    id: "a4",
    operation: "INSERT",
    record_id: "BIB-2026-012",
    created_at: "2026-09-25T14:00:00.000Z",
    actor_email: "admin@demo.example",
  },
];

export const demoMessages = async () => [
  {
    id: "m1",
    name: "Demo Visitor",
    email: "visitor@demo.example",
    message: "We would like to see how attendance and LMS data can be imported from our systems.",
    created_at: "2026-09-29T08:45:00.000Z",
  },
];
