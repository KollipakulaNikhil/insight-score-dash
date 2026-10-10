import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth.functions";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await getSession().catch(() => null);
    if (!user) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
