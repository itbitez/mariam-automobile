import "server-only";
import mysql from "mysql2/promise";

/**
 * MySQL connection pool.
 *
 * Replaces lib/supabase.js. The critical difference from the Supabase setup is
 * that this module must NEVER reach the browser — there is no anon key or row
 * level security here, so a leaked connection would be full write access to the
 * database. The "server-only" import above turns any accidental client import
 * into a build error rather than a silent security hole.
 */

let pool = null;

export function getPool() {
  if (pool) return pool;

  const { MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;
  if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER || !MYSQL_PASSWORD) return null;

  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    // Shared hosting caps concurrent connections tightly; 5 is plenty for a
    // site this size and leaves headroom for phpMyAdmin.
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60000,
    enableKeepAlive: true,
    charset: "utf8mb4",
    timezone: "Z",
    // The driver returns DECIMAL as a string to avoid float rounding. Prices and
    // rates are small enough that Number() is exact, and the rest of the app
    // expects numbers.
    decimalNumbers: true,
  });
  return pool;
}

/** Run a query and return the rows. Returns [] when the DB is not configured. */
export async function q(sql, params = []) {
  const p = getPool();
  if (!p) return [];
  const [rows] = await p.execute(sql, params);
  return rows;
}

/** Run a query and return the first row, or null. */
export async function q1(sql, params = []) {
  const rows = await q(sql, params);
  return rows.length ? rows[0] : null;
}

/** Run a write and return the driver's result (affectedRows, insertId). */
export async function exec(sql, params = []) {
  const p = getPool();
  if (!p) throw new Error("Database is not configured. Set MYSQL_* in .env.local.");
  const [result] = await p.execute(sql, params);
  return result;
}

/**
 * MySQL's JSON columns come back already parsed on some driver/server
 * combinations and as a string on others. Normalise both.
 */
export function readJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
