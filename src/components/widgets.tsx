import { riskBand } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "default" | "success" | "warning" | "danger" }) {
  const tones = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-bold", tones[tone ?? "default"])}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function BandBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">No data</span>;
  const band = riskBand(score);
  const cls =
    band === "On Track"
      ? "bg-success/15 text-success"
      : band === "Monitor"
        ? "bg-info/15 text-info"
        : band === "Needs Attention"
          ? "bg-warning/15 text-warning"
          : "bg-destructive/15 text-destructive";
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>{band}</span>;
}

export function ScoreRing({ score, size = 96 }: { score: number | null; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score ?? 0;
  const color = score === null ? "var(--muted)" : score >= 80 ? "var(--success)" : score >= 65 ? "var(--info)" : score >= 40 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} />
      </svg>
      <span className="absolute font-display text-xl font-bold">{score === null ? "—" : Math.round(score)}</span>
    </div>
  );
}

export function ProgressBar({ value, tone }: { value: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: tone ?? "var(--primary)" }} />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-lg font-semibold">{children}</h2>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}
