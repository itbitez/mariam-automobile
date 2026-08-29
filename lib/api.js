import "server-only";
import { NextResponse } from "next/server";
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
      return await handler(req, ctx, admin);
    } catch (e) {
      const status = e.status || 500;
      if (status === 401) return fail("Not signed in", 401);
      console.error("[api]", e);
      return fail(e.message || "Server error", status);
    }
  };
}

/** Same error handling, but public (no auth) — used by the login route. */
export function open(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      console.error("[api]", e);
      return fail(e.message || "Server error", e.status || 500);
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
