import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { BandBadge } from "@/components/widgets";
import { BAND_ORDER, byAttention, lowAttendance } from "@/lib/campus-derive";

const selectClass = "rounded-md border bg-background p-2 text-sm";
const LIMIT = 200;
const LEVELS = ["Low", "Medium", "High"];
const LEVEL_CLASS = {
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-success/15 text-success",
};
function LevelPill({ level }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_CLASS[level]}`}>
      {level}
    </span>
  );
}
export const pct = (v) => (v === null ? "—" : `${v.toFixed(v >= 99.95 ? 0 : 1)}%`);

/** A searchable, filterable list of students. Click a row's name to open the student. */
export function StudentTable({ rows, showMentor = false, initialFilter = "" }) {
  const [q, setQ] = useState("");
  const [band, setBand] = useState(initialFilter);
  const [branch, setBranch] = useState("");
  const [mentor, setMentor] = useState("");
  const [segment, setSegment] = useState("");
  const [acad, setAcad] = useState("");
  const [place, setPlace] = useState("");
  const branches = useMemo(() => [...new Set(rows.map((r) => r.branch))].sort(), [rows]);
  const segments = useMemo(() => [...new Set(rows.map((r) => r.segment))].sort(), [rows]);
  const mentors = useMemo(() => {
    const m = new Map();
    for (const r of rows) if (r.mentorId) m.set(r.mentorId, r.mentorName || r.mentorEmail);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return byAttention(
      rows.filter((r) => {
        if (needle && !`${r.name} ${r.id} ${r.ownerEmail}`.toLowerCase().includes(needle))
          return false;
        if (branch && r.branch !== branch) return false;
        if (segment && r.segment !== segment) return false;
        if (acad && r.academicRisk !== acad) return false;
        if (place && r.placementRisk !== place) return false;
        if (mentor === "none" && r.mentorId) return false;
        if (mentor && mentor !== "none" && r.mentorId !== mentor) return false;
        if (band === "nodata") return r.score === null;
        if (band === "lowatt") return lowAttendance(r);
        if (band === "atrisk") return r.band === "High Priority" || r.band === "Needs Attention";
        if (band) return r.band === band;
        return true;
      }),
    );
  }, [rows, q, band, branch, mentor, segment, acad, place]);
  const classAvg = useMemo(() => {
    const v = rows.map((r) => r.score).filter((x) => x !== null);
    return v.length ? v.reduce((a, c) => a + c, 0) / v.length : null;
  }, [rows]);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, ID or email"
          aria-label="Search students"
          className="max-w-xs"
        />
        <select
          value={band}
          onChange={(e) => setBand(e.target.value)}
          aria-label="Filter by status"
          className={selectClass}
        >
          <option value="">All statuses</option>
          <option value="atrisk">Needs help (at risk)</option>
          {BAND_ORDER.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
          <option value="lowatt">Attendance below 75%</option>
          <option value="nodata">No data yet</option>
        </select>
        {branches.length > 1 && (
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            aria-label="Filter by branch"
            className={selectClass}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          aria-label="Filter by segment"
          className={selectClass}
        >
          <option value="">All segments</option>
          {segments.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={acad}
          onChange={(e) => setAcad(e.target.value)}
          aria-label="Filter by academic risk"
          className={selectClass}
        >
          <option value="">Academic risk: all</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          aria-label="Filter by placement risk"
          className={selectClass}
        >
          <option value="">Placement risk: all</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        {showMentor && (
          <select
            value={mentor}
            onChange={(e) => setMentor(e.target.value)}
            aria-label="Filter by teacher"
            className={selectClass}
          >
            <option value="">All teachers</option>
            <option value="none">No teacher assigned</option>
            {mentors.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}
        <span className="text-sm text-muted-foreground">
          {shown.length} of {rows.length}
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-3">Student</th>
              <th>Status</th>
              <th>Score</th>
              <th>CGPA</th>
              <th>Attendance</th>
              <th>LMS</th>
              <th>Academic risk</th>
              <th>Placement risk</th>
              <th>vs class avg</th>
              <th>Alerts</th>
              <th>Segment</th>
              {showMentor && <th>Teacher</th>}
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, LIMIT).map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3">
                  <Link
                    to="/portal/students/$id"
                    params={{ id: r.id }}
                    className="font-medium text-primary hover:underline"
                  >
                    {r.name}
                  </Link>
                  <span className="block text-xs text-muted-foreground">
                    {r.id} · {r.branch} · Sem {r.semester}
                  </span>
                </td>
                <td>
                  <BandBadge score={r.score} />
                </td>
                <td>{r.score === null ? "—" : Math.round(r.score)}</td>
                <td>{r.cgpa === null ? "—" : r.cgpa.toFixed(2)}</td>
                <td className={lowAttendance(r) ? "font-medium text-destructive" : ""}>
                  {pct(r.attendance)}
                </td>
                <td>{pct(r.lms)}</td>
                <td>
                  <LevelPill level={r.academicRisk} />
                </td>
                <td>
                  <LevelPill level={r.placementRisk} />
                </td>
                <td
                  className={
                    classAvg !== null && r.score !== null && r.score < classAvg
                      ? "text-destructive"
                      : "text-success"
                  }
                >
                  {classAvg === null || r.score === null
                    ? "—"
                    : (r.score - classAvg > 0 ? "+" : "") + (r.score - classAvg).toFixed(1)}
                </td>
                <td className={r.urgent ? "font-medium text-destructive" : ""}>{r.alerts}</td>
                <td className="text-xs">{r.segment}</td>
                {showMentor && (
                  <td className={r.mentorId ? "" : "text-muted-foreground"}>
                    {r.mentorName || "Not assigned"}
                  </td>
                )}
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td
                  colSpan={showMentor ? 12 : 11}
                  className="p-6 text-center text-muted-foreground"
                >
                  No students match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {shown.length > LIMIT && (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing the first {LIMIT}. Use the search or filters to narrow the list.
        </p>
      )}
    </div>
  );
}
