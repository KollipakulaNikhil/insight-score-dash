import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  currentUser,
  endSession,
  hashPassword,
  limitByIp,
  startSession,
  verifyPassword,
} from "@/backend/auth.server";
import { requireAuth } from "@/backend/auth-middleware";
import { query, withTransaction } from "@/backend/db.server";
const email = z.string().trim().toLowerCase().email().max(254);
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.");
export const getSession = createServerFn({ method: "GET" }).handler(async () => currentUser());
export const signUp = createServerFn({ method: "POST" })
  .validator(z.object({ email, password, name: z.string().trim().max(100).default("") }))
  .handler(async ({ data }) => {
    limitByIp("signup", 10, 60 * 60 * 1000);
    const hash = await hashPassword(data.password);
    const id = await withTransaction(async (db) => {
      const created = await db.query(
        "INSERT INTO users(email, password_hash, display_name) VALUES($1,$2,$3) ON CONFLICT (email) DO NOTHING RETURNING id",
        [data.email, hash, data.name],
      );
      const row = created.rows[0];
      if (!row) return null;
      // Every new account starts as a student; staff roles are assigned by an operator.
      await db.query("INSERT INTO user_roles(user_id, role) VALUES($1,'student')", [row.id]);
      return row.id;
    });
    if (!id) throw new Error("An account with this email already exists. Try signing in.");
    await startSession(id);
    return { ok: true };
  });
export const signIn = createServerFn({ method: "POST" })
  .validator(z.object({ email, password: z.string().min(1).max(72) }))
  .handler(async ({ data }) => {
    limitByIp("signin", 20, 15 * 60 * 1000);
    const { rows } = await query("SELECT id, password_hash FROM users WHERE email = $1", [
      data.email,
    ]);
    const user = rows[0];
    const valid = await verifyPassword(data.password, user?.password_hash);
    if (!user || !valid) throw new Error("Incorrect email or password.");
    await startSession(user.id);
    return { ok: true };
  });
export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  endSession();
  return { ok: true };
});
export const changePassword = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(z.object({ current: z.string().min(1).max(72), next: password }))
  .handler(async ({ data, context }) => {
    limitByIp("passwd", 10, 15 * 60 * 1000);
    const { rows } = await query("SELECT password_hash FROM users WHERE id = $1", [
      context.user.id,
    ]);
    if (!(await verifyPassword(data.current, rows[0]?.password_hash)))
      throw new Error("Current password is incorrect.");
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      await hashPassword(data.next),
      context.user.id,
    ]);
    return { ok: true };
  });
export const sendContactMessage = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(
    z.object({
      name: z.string().trim().min(1).max(100),
      email,
      message: z.string().trim().min(5).max(4000),
    }),
  )
  .handler(async ({ data, context }) => {
    limitByIp("contact", 10, 60 * 60 * 1000);
    await query("INSERT INTO contact_messages(user_id, name, email, message) VALUES($1,$2,$3,$4)", [
      context.user.id,
      data.name,
      data.email,
      data.message,
    ]);
    return { saved: true };
  });
