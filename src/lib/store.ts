import { useSyncExternalStore } from "react";
import type { Student, Intervention, Complaint } from "./types";
import { SEED_STUDENTS } from "./seed";

export interface AppState {
  students: Student[];
  interventions: Intervention[];
  complaints: Complaint[];
  importLog: { date: string; added: number; duplicates: number; errors: number }[];
}

const KEY = "bib-insightiq-state-v1";

const seedState = (): AppState => ({
  students: SEED_STUDENTS,
  interventions: [
    {
      id: "INT-001", studentId: "BIB-2026-005", reason: "Multiple risk indicators: low CGPA, 3 backlogs, attendance 63%",
      action: "Weekly mentoring + study plan", priority: "high", owner: "Prof. Iyer",
      followUpDate: "2026-10-17", status: "in-progress", createdAt: "2026-10-01",
    },
  ],
  complaints: [
    { id: "CMP-001", from: "BIB-2026-003", text: "Confidential: difficulty with course pace (demo record)", date: "2026-09-28", reviewed: false },
  ],
  importLog: [],
});

let state: AppState = seedState();
const listeners = new Set<() => void>();

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

function setState(next: Partial<AppState>) {
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function addIntervention(i: Omit<Intervention, "id" | "createdAt">) {
  const id = `INT-${String(state.interventions.length + 1).padStart(3, "0")}`;
  setState({ interventions: [...state.interventions, { ...i, id, createdAt: new Date().toISOString().slice(0, 10) }] });
}

export function updateInterventionStatus(id: string, status: Intervention["status"]) {
  setState({ interventions: state.interventions.map((x) => (x.id === id ? { ...x, status } : x)) });
}

export function addStudents(newOnes: Student[], log: AppState["importLog"][number]) {
  setState({ students: [...state.students, ...newOnes], importLog: [...state.importLog, log] });
}

export function reviewComplaint(id: string, reviewer: string) {
  setState({ complaints: state.complaints.map((c) => (c.id === id ? { ...c, reviewed: true, reviewedBy: reviewer } : c)) });
}

export function resetDemo() {
  state = seedState();
  persist();
  listeners.forEach((l) => l());
}
