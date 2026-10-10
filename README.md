# BIB InsightIQ — Student Success Intelligence Platform

Built by **TEAM BIB (Biryani Intelligence Bureau)** for the **HacXLerate Smart Campus Analytics** challenge.

A prototype that brings seven student data sources — academics, attendance, LMS, skills, engagement, placement and feedback — together under one student ID. It works out an explainable **Student Success Score**, points out who needs help and why, and lets mentors record and track interventions.

- [What is in the project](#what-is-in-the-project)
- [Tech stack](#tech-stack)
- [Run it on your computer](#run-it-on-your-computer)
- [Environment variables](#environment-variables)
- [Roles and workspaces](#roles-and-workspaces)
- [Deploy to Vercel, step by step](#deploy-to-vercel-step-by-step)
- [Security notes](#security-notes)
- [Scoring rules](#scoring-rules)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Known limits](#known-limits)

## What is in the project

| Part                                                                   | Where                                              | Data                                                                 |
| ---------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| **Public website** (home, solution, benefits, privacy, contact, login) | `/`                                                | none                                                                 |
| **Fictional demo dashboards** (student, faculty, campus, data import)  | `/demo`, `/student`, `/faculty`, `/admin`, `/data` | Made-up data kept in your browser. Use **Reset demo** to restore it. |
| **Private workspaces** for real accounts                               | `/portal`                                          | Real data in PostgreSQL                                              |
| **Website assistant** (chat bubble)                                    | every public page                                  | Product help only. It cannot see any private record.                 |

The demo and the private workspaces are kept completely separate. Choosing a demo role never gives access to real data.

## Tech stack

- **App:** TanStack Start (React 19 + file-based routing), Vite, Tailwind CSS, shadcn/ui, Recharts. Plain JavaScript.
- **Database:** PostgreSQL through `node-postgres` (`pg`). SQL migrations in `db/migrations`.
- **Accounts:** email and password. Passwords are hashed with **bcrypt**; sign-in gives a signed **JWT** in an httpOnly cookie.
- **Assistant:** any OpenAI-compatible API through the Vercel AI SDK. The default is Google Gemini's free tier.
- **Hosting:** built with Nitro, so it deploys to Vercel with no extra configuration (or runs as a plain Node server).

## Run it on your computer

You need **Node.js 22.9 or newer** and a PostgreSQL database. The easiest are Docker (local) or a free [Neon](https://neon.tech) project.

```bash
git clone https://github.com/Ramcharan0600/insight-score-dash.git
cd insight-score-dash
git checkout bib

npm install
cp .env.example .env          # on Windows PowerShell: Copy-Item .env.example .env
```

Fill in `.env` (see the table below), then:

```bash
# local database, only if you use Docker (skip this if you use Neon)
docker compose up -d

npm run db:migrate            # creates the tables
npm run db:check              # should print "Schema OK"
npm run dev                   # prints the address, usually http://localhost:5173
```

The first account you sign up with is a student. To make yourself an administrator:

```bash
npm run db:set-role -- you@example.com admin
```

Refresh the portal and you will see the administrator workspace.

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env` (it is git-ignored).

| Variable            | Required          | What it is                                                                                                                                                                            |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | yes               | PostgreSQL connection string. For Neon, copy the **pooled** string (the host contains `-pooler`).                                                                                     |
| `JWT_SECRET`        | yes               | Random text, 32+ characters, used to sign logins. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Changing it signs everyone out. |
| `LLM_API_KEY`       | for the assistant | Free key from [Google AI Studio](https://aistudio.google.com/apikey). Without it the assistant says it is not configured; everything else still works.                                |
| `LLM_MODEL`         | no                | Default `gemini-2.5-flash`.                                                                                                                                                           |
| `LLM_BASE_URL`      | no                | Default `https://generativelanguage.googleapis.com/v1beta/openai/`. Any OpenAI-compatible provider works, for example OpenRouter.                                                     |
| `DATABASE_SSL`      | no                | SSL is automatic for any non-local host. Set `false` to turn it off.                                                                                                                  |
| `DATABASE_POOL_MAX` | no                | Connections per server instance. Default 3 on Vercel, 10 elsewhere.                                                                                                                   |

## Roles and workspaces

Everyone who signs up starts as a **student**. Administrators give **teacher** or **administrator** access under _People & roles_. Each role gets its own menu and pages under `/portal`.

**Student**
Home · Profile (editable) · Dashboard · Learning path · Attendance · LMS · Skills · Placement · Engagement · Feedback

- Students can edit their own name, phone, address, bio, LinkedIn and GitHub links, and the roles they are aiming for. Marks, attendance, branch, semester and mentor are set by staff.
- Pages show only what is recorded. Anything missing says "not recorded yet". Nothing is invented and missing data is never counted as zero.

**Teacher**
Home · My students · Interventions · Attendance & risk · Profile

- Sees only the students assigned to them. Can open a student's full profile, write feedback, and create and update interventions.

**Administrator**
Home · All students · Teachers · Assign students · People & roles · Student records · Interventions · Attendance & risk · Messages · Audit log · Profile

- _Assign students_: choose a teacher and tick students, or pick a teacher on a student's own row. Students without a record get a blank one, so they appear for the teacher immediately.
- _Student records_: add marks, attendance and skills with a form, or import many students as JSON.
- _Messages_: contact-form messages and concerns. _Audit log_: who changed what, and when.

Permissions are enforced on the server for every request. Hiding a page in the menu is only a convenience.

## Deploy to Vercel, step by step

You need free accounts on **GitHub**, **Vercel** and **Neon**, plus a Google account for the AI key. The code must be pushed to GitHub (branch `bib`).

### 1. Create the database (Neon)

1. Sign in at [neon.tech](https://neon.tech) and click **Create project**. Pick the region closest to your users. For Vercel's default region, **AWS US East (N. Virginia)** is a good choice.
2. On the project page click **Connect**. Turn **Connection pooling** on and copy the connection string. The host should contain `-pooler`.

### 2. Create the tables

On your computer, in the project folder:

1. Open `.env` and set `DATABASE_URL` to the string you copied.
2. Run `npm run db:migrate`, then `npm run db:check`. You should see **Schema OK**.

You do this once, and again whenever a new file appears in `db/migrations`.

### 3. Get the free AI key

Open [aistudio.google.com/apikey](https://aistudio.google.com/apikey), create a key and keep it. No card is needed. Free limits are small, so under heavy use the assistant may say it is busy.

### 4. Make a login secret

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Keep the output.

### 5. Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and choose **Import** next to `insight-score-dash`. If it is not listed, click _Adjust GitHub App Permissions_ and allow the repository.
2. Leave **Framework Preset** as detected (Nitro) or _Other_, **Build Command** `npm run build`, and **Install Command** `npm install`. Do not change the output directory: the build writes Vercel's own output format.
3. Open **Environment Variables** and add these (apply them to Production, Preview and Development):

   | Name           | Value                      |
   | -------------- | -------------------------- |
   | `DATABASE_URL` | the pooled Neon string     |
   | `JWT_SECRET`   | the secret from step 4     |
   | `LLM_API_KEY`  | the Google key from step 3 |

   Vercel does not read your `.env` file, so type them in here.

4. Do not click Deploy yet if you want to deploy the `bib` branch. Continue to step 6.

### 6. Choose which branch goes live

Vercel's production branch is `main` by default. Pick one:

- **Use `bib` as production:** after importing, go to **Settings → Git → Production Branch**, enter `bib`, and save. Then redeploy.
- **Or merge `bib` into `main`:** open a pull request from `bib` to `main` on GitHub and merge it. Vercel deploys `main` automatically.

Any other branch you push gets its own **Preview** URL, which uses the same environment variables.

### 7. Deploy

Click **Deploy** (or push a commit). The build takes a minute or two. When it finishes, open the URL Vercel shows.

### 8. Check that it works

1. Open the site. The home page and **/demo** should load with no sign-in.
2. Go to **/auth**, create an account, and confirm you land on the student **Home**.
3. Click the chat bubble and ask "What are the score bands?".

### 9. Make yourself administrator

Accounts start as students. On your computer, with `DATABASE_URL` in `.env` pointing at the same Neon database:

```bash
npm run db:set-role -- you@example.com admin
```

Refresh `/portal` and you will see the administrator menu. Then use **People & roles** to make teachers and **Assign students** to connect students to them.

### 10. Later changes

- **Update the site:** push to the production branch and Vercel redeploys.
- **New migrations:** run `npm run db:migrate` against the production database when a new file appears in `db/migrations`.
- **Change a variable:** edit it in **Settings → Environment Variables**, then redeploy (variables apply to new deployments only).
- **Custom domain:** **Settings → Domains → Add**.
- **Logs:** **Deployments →** your deployment **→ Logs** (build output and runtime errors).

### If something goes wrong

| Symptom                                                  | Likely cause and fix                                                                                                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Build fails                                              | Open the build log. Make sure the Node.js version in **Settings → General** is 22 or newer.                                         |
| "DATABASE_URL is not set"                                | The variable is missing or was added after the deploy. Add it, then redeploy.                                                       |
| "JWT_SECRET must be set…"                                | The secret is missing or shorter than 32 characters.                                                                                |
| Sign-up or sign-in errors, or pages show a generic error | Run `npm run db:check` with the same `DATABASE_URL`. Most often the migration was not applied, or the string is not the pooled one. |
| "Too many connections"                                   | Use the pooled Neon string, or lower `DATABASE_POOL_MAX`.                                                                           |
| Assistant says it is not configured                      | `LLM_API_KEY` is missing.                                                                                                           |
| Assistant says it is busy or errors                      | Google's free limits are reached. Wait, or set `LLM_BASE_URL` and `LLM_MODEL` for another provider.                                 |
| First page after a quiet period is slow                  | Free Neon databases and serverless functions wake up on demand. This is normal.                                                     |

## Security notes

- Passwords are hashed with bcrypt (cost 12). The login cookie is httpOnly and SameSite=Lax, and Secure in production. No token is kept in browser storage.
- Roles are re-read from the database on every request, never trusted from the token. Removing a role takes effect immediately.
- Server functions are protected against cross-site requests, and the assistant only accepts requests from the site itself.
- Sign-in, sign-up, chat and feedback are rate limited per IP **in memory**. On Vercel each request may reach a different instance, so these limits are only a light safeguard. For real abuse protection, turn on Vercel's firewall rate limiting.
- Keep `DATABASE_URL`, `JWT_SECRET` and `LLM_API_KEY` in your host's environment settings, never in the repository.

## Scoring rules

Prototype rules, not official university policy. The weights are in `src/lib/types.js`.

| Component                  | Weight |
| -------------------------- | ------ |
| Academics (CGPA × 10)      | 30%    |
| Attendance %               | 20%    |
| LMS completion             | 15%    |
| Engagement (verified only) | 10%    |
| Skills average             | 10%    |
| Placement readiness        | 15%    |

Risk bands: **80+ On Track · 65–79 Monitor · 50–64 Needs Attention · below 50 High Priority**.

**Missing data is never treated as zero.** Missing components are left out and the remaining weights are rescaled, with a visible completeness warning.

Attendance marks: 90%+ → 5 · 85–90 → 4 · 80–85 → 3 · 75–80 → 2 · below 75 → 0. The attendance page also shows how many classes are needed to reach 75, 80, 85 and 90%, and how many can still be missed.

Placement eligibility shows Pass, Fail or **Unknown** for each rule. A student is never marked eligible while a required rule is unknown.

## Project structure

```
db/migrations/        SQL schema (run with npm run db:migrate)
scripts/              db:migrate, db:check, db:set-role
src/backend/          server-only code: database pool, JWT sessions, rate limiting
src/lib/
  auth.functions.js     sign up / in / out, change password, contact form
  campus.functions.js   records, assignments, interventions, feedback, profile, audit
  campus-derive.js      scores, bands and summaries for the lists and home pages
  live-profile.js       alerts and deadlines from real recorded data
  scoring.js            score, attendance and eligibility rules
  chat.server.js        website assistant
src/components/
  portal/               sidebar shell, role-based pages, interventions, tables
  student-profile/      the student dashboard tabs
  AdminTools.jsx        assign students, roles, records, messages
src/routes/             pages (file-based routing; /portal/* are the private workspaces)
src/test/               unit tests
```

`src/routeTree.gen.ts` is generated by TanStack Router and is the only TypeScript file. Do not edit it.

## Scripts

| Command                             | What it does                                                          |
| ----------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                       | Development server                                                    |
| `npm run build`                     | Production build (on Vercel this produces Vercel's output format)     |
| `npm start`                         | Run a built app as a Node server (loads `.env`)                       |
| `npm test`                          | Unit tests                                                            |
| `npm run lint`                      | ESLint                                                                |
| `npm run db:migrate`                | Apply new SQL migrations                                              |
| `npm run db:check`                  | Check the database connection and tables                              |
| `npm run db:set-role -- email role` | Give or remove a role (`student`, `faculty`, `admin`; add `--revoke`) |

## Known limits

- **No email.** There is no self-service password reset or email confirmation. Signed-in users can change their password at `/reset-password`. Add an email provider before opening sign-up to the public.
- **No Google sign-in.** Only email and password.
- **Data entry is manual.** Marks, attendance and skills are entered by staff (form or JSON). A live import from campus systems is not built; see `roadmap.md`.
- **Free tiers are small.** Gemini's free quota and a free Neon database suit a prototype or demo, not a full campus.
