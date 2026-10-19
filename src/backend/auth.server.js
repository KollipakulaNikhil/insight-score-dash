import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { deleteCookie, getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { query } from "./db.server";
import { clientIp, rateLimit } from "./rate-limit.server";
const COOKIE = "bib_session";
// The cookie itself is a browser-session cookie (see below); the token is also short-lived.
const SESSION_SECONDS = 60 * 60 * 12;
const BCRYPT_COST = 12;
// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);
function secretKey() {
  const secret = process.env["JWT_SECRET"];
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}
export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_COST);
export async function verifyPassword(password, hash) {
  const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return hash ? ok : false;
}
export async function startSession(userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("bib-insightiq")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    // No maxAge: the browser drops the cookie when it is closed.
  });
}
export const endSession = () => deleteCookie(COOKIE, { path: "/" });
// Roles and the account itself are re-read from the database on every call, so removing a
// role or deleting a user takes effect immediately instead of when the token expires.
export async function currentUser() {
  const token = getCookie(COOKIE);
  if (!token) return null;
  let userId;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: "bib-insightiq",
      algorithms: ["HS256"],
    });
    if (!payload.sub) return null;
    userId = payload.sub;
  } catch {
    return null;
  }
  const { rows } = await query(
    `SELECT u.id, u.email, u.display_name,
            COALESCE(array_agg(r.role::text) FILTER (WHERE r.role IS NOT NULL), ARRAY[]::text[]) AS roles
       FROM users u LEFT JOIN user_roles r ON r.user_id = u.id
      WHERE u.id = $1 GROUP BY u.id`,
    [userId],
  );
  const row = rows[0];
  return row
    ? { id: row.id, email: row.email, displayName: row.display_name, roles: row.roles }
    : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized: please sign in.");
  return user;
}
export function limitByIp(scope, max, windowMs) {
  if (!rateLimit(`${scope}:${clientIp(getRequest())}`, max, windowMs)) {
    throw new Error("Too many attempts. Please wait a few minutes and try again.");
  }
}
