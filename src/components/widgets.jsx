import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarCheck,
  Gauge,
  GraduationCap,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { riskBand } from "@/lib/types";
import { cn } from "@/lib/utils";
// Each metric gets its own icon and colour so a row of stats reads at a glance.
const HUES = {
  emerald: "bg-emerald-400/15 text-emerald-300",
  indigo: "bg-indigo-400/15 text-indigo-300",
  sky: "bg-sky-400/15 text-sky-300",
  violet: "bg-violet-400/15 text-violet-300",
  amber: "bg-amber-400/15 text-amber-300",
  rose: "bg-rose-400/15 text-rose-300",
  teal: "bg-teal-400/15 text-teal-300",
};
const METRICS = [
  [/score|average score/i, Gauge, "emerald"],
  [/cgpa|sgpa|grade/i, GraduationCap, "indigo"],
  [/attend|classes/i, CalendarCheck, "sky"],
  [/lms|assess|learn/i, BookOpen, "violet"],
  [/placement|aptitude|coding/i, Briefcase, "teal"],
  [/alert|need|help|backlog|overdue/i, TriangleAlert, "rose"],
  [/follow|teacher|mentor/i, UserCheck, "amber"],
  [/student|branch|total/i, Users, "indigo"],
  [/best|subject/i, Award, "amber"],
];
export function StatCard({ label, value, sub, tone }) {
  const tones = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };
  const [, Icon, hue] = METRICS.find(([re]) => re.test(label)) ?? [null, BarChart3, "teal"];
  const chip =
    tone === "danger"
      ? HUES.rose
      : tone === "warning"
        ? HUES.amber
        : tone === "success"
          ? HUES.emerald
          : HUES[hue];
  return (
    <div className="surface group p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", chip)}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <div
        className={cn(
          "mt-2 font-display text-3xl font-bold tabular-nums leading-none",
          tones[tone ?? "default"],
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
export function BandBadge({ score }) {
  if (score === null)
    return (
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
        No data
      </span>
    );
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
export function ScoreRing({ score, size = 96 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score ?? 0;
  const color =
    score === null
      ? "var(--muted)"
      : score >= 80
        ? "var(--success)"
        : score >= 65
          ? "var(--info)"
          : score >= 40
            ? "var(--warning)"
            : "var(--destructive)";
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
        />
      </svg>
      <span className="absolute font-display text-xl font-bold">
        {score === null ? "—" : Math.round(score)}
      </span>
    </div>
  );
}
export function ProgressBar({ value, tone }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: tone ?? "var(--primary)",
        }}
      />
    </div>
  );
}
export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-lg font-semibold">{children}</h2>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}
