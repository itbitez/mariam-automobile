import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { q1, exec } from "@/lib/db";
import {
  SESSION_COOKIE,
  getAdmin,
  verifyPassword,
  createSession,
  destroySession,
  sessionCookieOptions,
  toMysqlDate,
} from "@/lib/auth";
import { ok, fail, open, readBody, str } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET — who am I? Replaces supabase.auth.getSession(). */
export const GET = open(async () => {
  const admin = await getAdmin();
  return NextResponse.json({ ok: true, admin });
});

/** POST — sign in. Replaces supabase.auth.signInWithPassword(). */
export const POST = open(async (req) => {
  const body = await readBody(req);
  const email = str(body.email, 191).toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) return fail("Email and password are required.", 400);

  const user = await q1("SELECT id, email, password_hash FROM admin_users WHERE email = ?", [email]);

  // A stored hash that does not parse means the row was hand-edited or the
  // value was truncated on paste — not that the password is wrong. The client
  // still gets the same 401 (saying more would leak which emails exist), but
  // without this line the two are indistinguishable and the account looks
  // simply "broken" with no way to tell why.
  if (user && !/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/.test(user.password_hash || "")) {
    console.warn(
      `[auth] password_hash for ${email} is malformed (length ${String(user.password_hash || "").length}, expected 168). ` +
        `No password can match it. Reset with: npm run admin:create -- ${email} "new-password"`
    );
  }

  // Same message and rough timing whether the account is missing or the
  // password is wrong, so this cannot be used to enumerate valid emails.
  const good = user ? await verifyPassword(password, user.password_hash) : await verifyPassword(password, "scrypt:00:00");
  if (!user || !good) return fail("Wrong email or password.", 401);

  const { token, expires } = await createSession(user.id);
  await exec("UPDATE admin_users SET last_login_at = ? WHERE id = ?", [toMysqlDate(), user.id]);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions(expires));

  return ok({ admin: { id: user.id, email: user.email } });
});

/** DELETE — sign out. Replaces supabase.auth.signOut(). */
export const DELETE = open(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  await destroySession(token);
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(new Date(0)), maxAge: 0 });
  return ok();
});
