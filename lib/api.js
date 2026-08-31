import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

/**
 * Shared plumbing for the admin API.
 *
 * Under Supabase, row level security enforced permissions inside the database,
 * so a route that forgot to check auth still could not write. MySQL has no such
 * backstop — `guard` below is the only thing between the public internet and
 * the database, so every mutating handler must go through it.
 */

export function ok(data = {}) {
  return NextResponse.json({ ok: true, ...data });
}

export function fail(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Wraps a handler so it runs only for a signed-in admin, and so a thrown error
 * becomes a clean JSON response instead of an HTML error page the admin panel
 * cannot parse.
 */
export function guard(handler) {
  return async (req, ctx) => {
    try {
      const admin = await requireAdmin();
      const res = await handler(req, ctx, admin);

      // Every public page sets `export const revalidate = 60`. That is
      // stale-while-revalidate, not "updates within a minute": once the copy is
      // a minute old the next visitor is still served the OLD page, and their
      // request only *schedules* a rebuild — so the edit appears to whoever
      // loads it after that. Refreshing does not help, because the stale copy
      // lives in the server's cache and not in the browser, which is why an
      // edit looks lost until it abruptly is not.
      //
      // Purging here means an admin edit is live on the very next request. The
      // whole tree goes rather than a list of paths, because the list is the
      // part that rots: settings reach every header and footer, one car reaches
      // the home page and two listings, and a path someone forgets to add is
      // invisible until a customer sees stale content. The site is small and
      // admin writes are rare, so rebuilding everything costs less than
      // maintaining that list correctly.
      if (req.method !== "GET" && res.status < 400) {
        // A failed purge must not fail the request — the write already landed.
        try {
          revalidatePath("/", "layout");
        } catch (e) {
          console.error("[api] revalidate failed", e);
        }
      }

      return res;
    } catch (e) {
      const status = e.status || 500;
      if (status === 401) return fail("Not signed in", 401);
      console.error("[api]", e);
      return fail(e.message || "Server error", status);
    }
  };
}

/**
 * Same error handling, but public (no auth) — used by the login route.
 *
 * Unexpected failures return a generic message. An unhandled database error
 * here would otherwise echo connection details (hostnames, usernames) to
 * anyone who can reach the login form. Deliberate 4xx responses still carry
 * their own message, because those are meant for the user.
 */
export function open(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      console.error("[api]", e);
      const status = e.status || 500;
      if (status >= 500) return fail("Something went wrong. Please try again.", status);
      return fail(e.message || "Request failed", status);
    }
  };
}

export async function readBody(req) {
  try {
    return (await req.json()) || {};
  } catch {
    return {};
  }
}

export const str = (v, max = 500) => String(v ?? "").trim().slice(0, max);
export const num = (v, fallback = 0) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? fallback : Number(v));
export const bit = (v) => (v ? 1 : 0);
