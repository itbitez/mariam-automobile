import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { exec } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX = { name: 120, phone: 40, car: 160, budget: 80, payment: 80, message: 2000 };

/**
 * Trim, cap the length, and swap out control characters so nothing odd
 * reaches the database.
 */
function clean(value, limit) {
  const raw = String(value == null ? "" : value);
  let out = "";
  for (const ch of raw) {
    const code = ch.codePointAt(0);
    out += code < 32 || code === 127 ? " " : ch;
  }
  return out.trim().slice(0, limit);
}

/**
 * Very small in-memory throttle. Enough to stop a stuck submit button or a
 * casual script; it resets on redeploy and is per-instance, not a real WAF.
 */
const recent = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(key) {
  const now = Date.now();
  const hits = (recent.get(key) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 500) {
    for (const [k, v] of recent) if (!v.some((t) => now - t < WINDOW_MS)) recent.delete(k);
  }
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real users never fill a hidden field.
  if (clean(body.company, 100)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const lead = {
    name: clean(body.name, MAX.name),
    phone: clean(body.phone, MAX.phone),
    car: clean(body.car, MAX.car),
    budget: clean(body.budget, MAX.budget),
    payment: clean(body.payment, MAX.payment),
    message: clean(body.message, MAX.message),
    source: clean(body.source, 40) || "homepage",
  };

  if (!lead.name || !lead.phone) {
    return NextResponse.json({ ok: false, error: "Name and mobile number are required." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many submissions. Please try again shortly." }, { status: 429 });
  }

  // Deliberately unauthenticated — this replaces the "leads public insert" RLS
  // policy. Reading them back requires an admin session (/api/admin/leads).
  try {
    await exec(
      `INSERT INTO leads (id, name, phone, car, budget, payment, message, source, user_agent)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        randomUUID(),
        lead.name ?? "",
        lead.phone ?? "",
        lead.car ?? "",
        lead.budget ?? "",
        lead.payment ?? "",
        lead.message ?? "",
        lead.source ?? "homepage",
        clean(request.headers.get("user-agent"), 300),
      ]
    );
  } catch (e) {
    console.warn("[lead] not saved:", e.message);
    return NextResponse.json({ ok: false, error: "Could not save your enquiry. Please call us instead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: true });
}
