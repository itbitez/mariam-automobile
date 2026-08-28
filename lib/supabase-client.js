"use client";

import { createClient } from "@supabase/supabase-js";

let client = null;

/** True when the build had the Supabase env vars baked in. */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function realClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY, then rebuild — these values are baked " +
        "in at build time, so restarting alone is not enough."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

/**
 * Returns a lazy stand-in for the Supabase browser client.
 *
 * Every admin component holds this at module scope (`const supabase = ...`).
 * Building it eagerly meant `createClient()` ran the moment the module was
 * imported — including while Next prerendered /admin on the build server, where
 * the env vars may not be present. That threw "supabaseUrl is required" and
 * failed the whole build.
 *
 * The proxy defers construction until a property is actually touched, which
 * only ever happens inside effects and event handlers in the browser.
 */
export function getSupabaseClient() {
  return new Proxy(Object.create(null), {
    get(_target, prop) {
      const c = realClient();
      const value = c[prop];
      return typeof value === "function" ? value.bind(c) : value;
    },
    set(_target, prop, value) {
      realClient()[prop] = value;
      return true;
    },
    has(_target, prop) {
      return prop in realClient();
    },
  });
}
