import { useSyncExternalStore } from "react";
import { SEED_STUDENTS } from "./seed";
const KEY = "bib-insightiq-state-v1";
const seedState = () => ({
  students: SEED_STUDENTS,
  interventions: [
    {
      id: "INT-001",
      studentId: "BIB-2026-005",
      reason: "Multiple risk indicators: low CGPA, 3 backlogs, attendance 63%",
      action: "Weekly mentoring + study plan",
      priority: "high",
      owner: "Prof. Iyer",
      followUpDate: "2026-10-17",
      status: "in-progress",
      createdAt: "2026-10-01",
    },
  ],
  complaints: [
    {
      id: "CMP-001",
      from: "BIB-2026-003",
      text: "Confidential: difficulty with course pace (demo record)",
      date: "2026-09-28",
      reviewed: false,
    },
  ],
  importLog: [],
});
const serverState = seedState();
let state = serverState;
const listeners = new Set();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {
    /* keep seed */
  }
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* demo mode */
  }
}
if (typeof window !== "undefined") load();
function setState(next) {
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}
export function useAppState() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => serverState,
  );
}
export function addIntervention(i) {
  const id = `INT-${String(state.interventions.length + 1).padStart(3, "0")}`;
  setState({
    interventions: [
      ...state.interventions,
      { ...i, id, createdAt: new Date().toISOString().slice(0, 10) },
    ],
  });
}
export function updateInterventionStatus(id, status) {
  setState({ interventions: state.interventions.map((x) => (x.id === id ? { ...x, status } : x)) });
}
export function addStudents(newOnes, log) {
  setState({ students: [...state.students, ...newOnes], importLog: [...state.importLog, log] });
}
export function reviewComplaint(id, reviewer) {
  setState({
    complaints: state.complaints.map((c) =>
      c.id === id ? { ...c, reviewed: true, reviewedBy: reviewer } : c,
    ),
  });
}
export function addComplaint(from, text) {
  const id = `CMP-${String(state.complaints.length + 1).padStart(3, "0")}`;
  setState({
    complaints: [
      ...state.complaints,
      { id, from, text, date: new Date().toISOString().slice(0, 10), reviewed: false },
    ],
  });
}
export function resetDemo() {
  state = seedState();
  persist();
  listeners.forEach((l) => l());
}
