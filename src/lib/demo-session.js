import { useSyncExternalStore } from "react";
export const DEMO_STUDENT_ID = "BIB-2026-001";
const KEY = "bib-demo-session";
const listeners = new Set();
let cache;
function read() {
  if (cache !== undefined) return cache;
  try {
    const raw = sessionStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : null;
  } catch {
    cache = null;
  }
  return cache;
}
export function setDemoSession(s) {
  cache = s;
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
export function useDemoSession() {
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
export function canOpen(session, allow) {
  if (!allow || !session) return true;
  return allow.includes(session.role);
}
