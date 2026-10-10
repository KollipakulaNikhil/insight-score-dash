import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/metadata";
import { signIn, signUp } from "@/lib/auth.functions";
import {
  GraduationCap,
  Users,
  Building2,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useAccount } from "@/lib/account";
import { DemoAccess } from "@/components/DemoAccess";
export const Route = createFileRoute("/auth")({
  head: () =>
    pageHead("Log In", "Sign in to BIB InsightIQ with student, faculty or administrator access."),
  component: Auth,
});
function Auth() {
  const [role, setRole] = useState("Student");
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user, refresh } = useAccount();
  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password") ?? "");
    try {
      if (mode === "signup") {
        await signUp({ data: { email, password, name: String(form.get("name") ?? "") } });
      } else {
        await signIn({ data: { email, password } });
      }
      await refresh();
      await navigate({ to: "/portal" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicLayout>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="eyebrow text-center">YOUR CAMPUS, CONNECTED</p>
        <h1 className="mt-3 text-center font-display text-3xl font-semibold">
          {mode === "signup" ? "Create your account" : "Welcome to InsightIQ"}
        </h1>
        <p className="mt-3 text-center text-muted-foreground">
          Choose your workspace. Your authorized account determines access.
        </p>
        <DemoAccess />
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { name: "Student", icon: GraduationCap },
            { name: "Teacher / Faculty / Mentor", icon: Users },
            { name: "Admin", icon: Building2 },
          ].map((r) => (
            <Button
              key={r.name}
              variant={role === r.name ? "default" : "outline"}
              className="h-auto min-h-24 flex-col whitespace-normal px-2 py-4 text-center"
              onClick={() => setRole(r.name)}
              aria-pressed={role === r.name}
            >
              <r.icon className="size-6" />
              <span>{r.name}</span>
            </Button>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-md rounded-lg border bg-card p-6 sm:p-8">
          <p className="mb-5 text-sm">
            Selected workspace: <strong className="text-primary">{role}</strong>
          </p>
          {user ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">You are already signed in.</p>
              <Button asChild className="w-full">
                <Link to="/portal">
                  Open my account <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <label className="block text-sm">
                    Full name
                    <Input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      className="mt-2"
                    />
                  </label>
                )}
                <label className="block text-sm">
                  Email address
                  <Input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-2"
                    placeholder="you@college.edu"
                  />
                </label>
                {
                  <label className="block text-sm">
                    Password
                    <Input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="mt-2"
                    />
                  </label>
                }
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                {message && (
                  <p role="status" className="text-sm text-success">
                    {message}
                  </p>
                )}
                <Button disabled={busy} className="w-full" type="submit">
                  {busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
                  {mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setMode(mode === "signup" ? "login" : "signup");
                    setError("");
                    setMessage("");
                  }}
                >
                  {mode === "signup" ? "Already have an account? Sign in" : "Create an account"}
                </Button>
              </div>
            </>
          )}
          <p className="mt-6 flex gap-2 border-t pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" />
            All new accounts start with student access. Faculty and administrator permissions are
            granted separately by an authorized operator.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Just looking around?{" "}
          <Link to="/demo" className="text-primary">
            Explore the fictional demo
          </Link>
        </p>
      </main>
    </PublicLayout>
  );
}
