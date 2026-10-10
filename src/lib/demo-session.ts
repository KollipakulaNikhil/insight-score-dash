import { useSyncExternalStore } from "react";

/**
 * Fictional demo identity for the public test workspaces.
 * This only shapes what the demo UI shows; it never grants access to private Cloud records.
 */
export type DemoRole = "student" | "faculty" | "admin";
export interface DemoSession { role: DemoRole; studentId?: string; name: string }

export const DEMO_STUDENT_ID = "BIB-2026-001";
const KEY = "bib-demo-session";
const listeners = new Set<() => void>();
let cache: DemoSession | null | undefined;

function read(): DemoSession | null {
  if (cache !== undefined) return cache;
  try {
    const raw = sessionStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export function setDemoSession(s: DemoSession | null) {
  cache = s;
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useDemoSession(): DemoSession | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => null,
  );
}

/** Which demo pages each fictional role may open. No role = open guided walkthrough. */
export function canOpen(session: DemoSession | null, allow: DemoRole[] | undefined): boolean {
  if (!allow || !session) return true;
  return allow.includes(session.role);
}
