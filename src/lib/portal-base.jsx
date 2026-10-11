import { createContext, useContext } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

/**
 * The portal pages run in two places: the real workspace under /portal (server data, sign-in
 * required) and a read-only walkthrough under /demo-portal (fictional data held in the browser).
 * This context tells shared components which one they are in. It only changes where links go
 * and where data comes from; it is never used to decide what a person may access.
 */
export const LIVE = { demo: false, role: null };
export const PortalModeContext = createContext(LIVE);
export const usePortalMode = () => useContext(PortalModeContext);

export const DEMO_ROUTE = "/demo-portal/$";

/** Turns a live portal path such as "/portal/students/$id" into the matching walkthrough route. */
export function demoTarget(to, params, role) {
  const rest = to.replace(/^\/portal\/?/, "");
  const splat = rest.replace(/\$(\w+)/g, (_, key) => encodeURIComponent(params?.[key] ?? ""));
  return { to: DEMO_ROUTE, params: { _splat: splat }, search: { role } };
}

/** A Link that keeps navigation inside the walkthrough when rendered there. */
export function PLink({ to, params, search, ...props }) {
  const mode = usePortalMode();
  if (mode.demo && typeof to === "string" && to.startsWith("/portal")) {
    const target = demoTarget(to, params, mode.role);
    return <Link {...props} to={target.to} params={target.params} search={target.search} />;
  }
  return <Link {...props} to={to} params={params} search={search} />;
}

export const DEMO_READ_ONLY = "This is a read-only demonstration. Sign in to make real changes.";

/** useServerFn for live pages; in the walkthrough every change is refused. */
export function useAction(fn) {
  const run = useServerFn(fn);
  const { demo } = usePortalMode();
  return demo
    ? async () => {
        throw new Error(DEMO_READ_ONLY);
      }
    : run;
}
