import { q, getPool } from "@/lib/db";
import { ok, guard } from "@/lib/api";
import { uploadDir } from "@/lib/uploads";
import fs from "node:fs";

export const dynamic = "force-dynamic";

const TABLES = ["cars", "home_content", "site_settings", "calc_settings", "leads", "happy_customers", "media", "admin_users"];

/**
 * Database health for Admin → Database setup.
 *
 * The old version probed each table straight from the browser with the anon
 * key. There is no browser-side database access any more, so the check runs
 * here and reports back.
 */
export const GET = guard(async () => {
  const checks = [];

  for (const table of TABLES) {
    try {
      const rows = await q(`SELECT COUNT(*) AS n FROM \`${table}\``);
      checks.push({ table, ok: true, rows: Number(rows[0]?.n ?? 0) });
    } catch (e) {
      checks.push({ table, ok: false, error: e.code === "ER_NO_SUCH_TABLE" ? "Table missing" : e.message });
    }
  }

  // The upload directory is as important as the tables: if it is not writable,
  // every image upload fails at the moment someone tries it.
  let uploads = { ok: false, path: null, error: null };
  try {
    const dir = uploadDir();
    fs.accessSync(dir, fs.constants.W_OK);
    const count = fs.readdirSync(dir).filter((f) => !f.startsWith(".")).length;
    uploads = { ok: true, path: dir, files: count, error: null };
  } catch (e) {
    uploads = { ok: false, path: process.env.UPLOAD_DIR || "(default)", error: e.message };
  }

  return ok({ connected: Boolean(getPool()), checks, uploads });
});
