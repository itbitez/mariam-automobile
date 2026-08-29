/**
 * Dumps every table out of Supabase to mysql/data/*.json.
 *
 *   npm run migrate:export
 *
 * Read-only — it never writes to Supabase. Run this while the old project is
 * still alive; the JSON it produces is the input for migrate:import.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "./db-env.mjs";
import { createClient } from "@supabase/supabase-js";

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Supabase env vars missing from .env.local — nothing to export from.");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const OUT = path.resolve("mysql/data");
fs.mkdirSync(OUT, { recursive: true });

// leads are admin-read-only under RLS, so an anon export returns nothing —
// that is expected, not a failure.
const TABLES = ["cars", "home_content", "site_settings", "calc_settings", "happy_customers", "leads"];

let total = 0;
for (const table of TABLES) {
  process.stdout.write(`${table.padEnd(18)}`);
  try {
    const { data, error } = await sb.from(table).select("*");
    if (error) throw error;
    const rows = data || [];
    fs.writeFileSync(path.join(OUT, `${table}.json`), JSON.stringify(rows, null, 2));
    total += rows.length;
    console.log(`${rows.length} row(s)`);
  } catch (e) {
    console.log(`skipped — ${e.message}`);
    fs.writeFileSync(path.join(OUT, `${table}.json`), "[]");
  }
}

console.log(`\n${total} rows written to mysql/data/`);
