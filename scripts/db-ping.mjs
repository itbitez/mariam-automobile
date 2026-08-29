/**
 * Connectivity check for the MySQL database.
 *
 *   npm run db:ping
 *
 * Hostinger blocks MySQL from outside its network until you enable Remote MySQL
 * in hPanel and whitelist the connecting IP, so this failing with ETIMEDOUT or
 * ECONNREFUSED usually means a firewall rule, not a bad password.
 */
import { loadEnv, getConfig } from "./db-env.mjs";
import mysql from "mysql2/promise";

loadEnv();
const cfg = getConfig();

console.log(`host : ${cfg.host}:${cfg.port}`);
console.log(`db   : ${cfg.database}`);
console.log(`user : ${cfg.user}`);
console.log("");

try {
  const c = await mysql.createConnection({ ...cfg, connectTimeout: 15000 });
  const [[info]] = await c.query("SELECT VERSION() AS version, DATABASE() AS db, NOW() AS now");
  console.log("Connected.");
  console.log(`  server : ${info.version}`);
  console.log(`  schema : ${info.db}`);

  const [tables] = await c.query("SHOW TABLES");
  const names = tables.map((r) => Object.values(r)[0]);
  console.log(`  tables : ${names.length ? names.join(", ") : "(none yet — run mysql/01-schema.sql)"}`);
  await c.end();
} catch (e) {
  console.error(`FAILED (${e.code || "error"}): ${e.message}`);
  if (["ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND", "EHOSTUNREACH"].includes(e.code)) {
    console.error(
      "\nThe server did not accept the TCP connection. In hPanel open\n" +
        "Databases → Remote MySQL and add your current IP address (or %25 to allow any),\n" +
        "then run this again."
    );
  } else if (e.code === "ER_ACCESS_DENIED_ERROR") {
    console.error("\nReached the server but the username or password was rejected.");
  }
  process.exitCode = 1;
}
