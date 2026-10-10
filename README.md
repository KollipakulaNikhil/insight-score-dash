# BIB InsightIQ — Student Success Intelligence Platform

Built by **TEAM BIB (Biryani Intelligence Bureau)** for the **HacXLerate Smart Campus Analytics** challenge.

## What it is

A prototype that unifies seven student data sources — academics, attendance, LMS, skills, engagement, placement, and feedback — under a single student ID, computes an explainable Student Success Score, surfaces cross-source risk insights, and supports mentor interventions.

## Demo mode

The app runs in **synthetic demo mode**: all data is fictional and persisted in the browser (localStorage). No live university system is connected, and no secrets are used. Use **Reset demo** in the header to restore seed data. If Lovable Cloud is enabled later, the same screens can be backed by a real database with row-level security (students see their own records, faculty see assigned students, admins see administrative data).

## Setup

```bash
bun install
bun run dev      # http://localhost:8080
bun run test     # calculation & validation tests (vitest)
bun run build
```

## Scoring assumptions (prototype, not official policy)

Success Score (0–100), weights configurable in `src/lib/types.ts`:

| Component | Weight |
|---|---|
| Academics (CGPA × 10) | 30% |
| Attendance % | 20% |
| LMS completion | 15% |
| Engagement (verified only) | 10% |
| Skills average | 10% |
| Placement readiness | 15% |

Risk bands: 80+ On Track · 65–79 Monitor · 40–64 Needs Attention · <40 High Priority.

**Missing data is never treated as zero** — absent components are excluded and the remaining weights renormalized, with a visible completeness warning.

Attendance marks bands: ≥90% → 5 · 85–90 → 4 · 80–85 → 3 · 75–80 → 2 · <75 → 0. The attendance tab also computes classes needed to reach 75/80/85/90% and how many more classes can be missed.

Placement eligibility: every criterion shows Pass / Fail / **Unknown**; a student is never marked eligible while a required criterion is unknown.

## Testing

`src/test/scoring.test.ts` covers attendance band boundaries, classes-needed/missable math, risk band boundaries, missing-data handling, eligibility-unknown rules, and CSV duplicate/missing-field validation.

## Demo script

Open **Hackathon Demo** in the nav for the repeatable 8-step walkthrough (student profile → cross-source insight → score explanation → faculty view → intervention → admin aggregates) plus the pitch section and a demo reset.

## Structure

- `src/lib/types.ts` — data model, weights, risk bands
- `src/lib/seed.ts` — fictional demo dataset
- `src/lib/scoring.ts` — attendance/LMS math, success score, eligibility, insights, recommendations
- `src/lib/csv.ts` — CSV parsing & validation
- `src/lib/store.ts` — localStorage-backed state (students, interventions, complaints, import log)
- `src/routes/` — Home, Admin, Faculty, Student (list + profile), Data & Import, Hackathon Demo

## Deployment

Publish from the Lovable editor (Publish button). No environment variables are required in demo mode.
