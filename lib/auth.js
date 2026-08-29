import "server-only";
import { randomBytes, randomUUID, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { q1, exec } from "./db";

const scrypt = promisify(_scrypt);

export const SESSION_COOKIE = "mariam_admin";
const SESSION_DAYS = 14;

/**
 * Admin authentication.
 *
 * Supabase Auth issued a JWT the browser held, and row level security enforced
 * permissions inside the database. Neither exists in MySQL, so:
 *
 *   - passwords are scrypt hashes in admin_users
 *   - the browser holds only an opaque random token in an httpOnly cookie,
 *     so it is useless to JavaScript and to anyone reading localStorage
 *   - every write route calls requireAdmin(), which is now the ONLY thing
 *     standing between the public internet and the database
 *
 * That last point is the important one. With RLS, forgetting a check failed
 * closed. Here it fails open — so every route that mutates data must call
 * requireAdmin() before touching the database.
 */

/* ---------- passwords ---------- */

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== "string") return false;
  const [scheme, salt, hex] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  // Lengths must match before timingSafeEqual, which throws otherwise.
  if (expected.length !== key.length) return false;
  return timingSafeEqual(key, expected);
}

/* ---------- sessions ---------- */

export async function createSession(userId) {
  const token = randomBytes(32).toString("hex"); // 64 chars, matches CHAR(64)
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await exec("INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)", [
    token,
    userId,
    toMysqlDate(expires),
  ]);
  return { token, expires };
}

export async function destroySession(token) {
  if (!token) return;
  await exec("DELETE FROM admin_sessions WHERE token = ?", [token]);
}

/**
 * Resolves the signed-in admin from the request cookie, or null.
 * Expired rows are deleted on sight rather than by a scheduled job.
 */
export async function getAdmin() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length !== 64) return null;

  const row = await q1(
    `SELECT s.token, s.expires_at, u.id, u.email
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
      WHERE s.token = ?`,
    [token]
  );
  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }
  return { id: row.id, email: row.email };
}

/**
 * Guard for every mutating route. Throws an object the route handlers turn into
 * a 401 — see jsonError below.
 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    const err = new Error("Not signed in");
    err.status = 401;
    throw err;
  }
  return admin;
}

/* ---------- helpers ---------- */

export function newId() {
  return randomUUID();
}

/** MySQL DATETIME wants 'YYYY-MM-DD HH:MM:SS' in UTC, not an ISO string. */
export function toMysqlDate(d = new Date()) {
  return new Date(d).toISOString().slice(0, 19).replace("T", " ");
}

export function sessionCookieOptions(expires) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}
