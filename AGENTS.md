<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep public fictional dashboards separate from the authenticated campus portal so browser demo state can never become an authorization source.
- Store permissions in protected user_roles and link live student records to profile owners and assigned faculty; enforce record access through database policies and authenticated server functions.
- Keep website navigation shared in PublicLayout and account state in one root AccountProvider so sign-in affordances reflect the current session without duplicate listeners.
- Compose the website assistant from AI Elements with the AI SDK UI-message stream, keeping prompts, full conversation transport and provider calls server-side.
- Store live record mutations and mentor interventions in Cloud; return success only after confirmed writes and invalidate the shared campus query to refresh derived scores.
- Use a stable seed snapshot for SSR hydration of the browser-only demo store to avoid mismatches after saved demo changes.
