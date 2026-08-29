/**
 * Creates or updates an admin login.
 *
 *   npm run admin:create -- you@example.com "your-password"
 *
 * Replaces "invite a user" in the Supabase dashboard. Passwords are stored as
 * scrypt hashes; the plain text is never written anywhere.
 */
import { randomUUID, scrypt as _scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";
import { loadEnv, getConfig } from "./db-env.mjs";

const scrypt = promisify(_scrypt);

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run admin:create -- you@example.com "your-password"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

loadEnv();
const c = await mysql.createConnection({ ...getConfig(), connectTimeout: 15000 });

const salt = randomBytes(16).toString("hex");
const key = await scrypt(password, salt, 64);
const hash = `scrypt:${salt}:${key.toString("hex")}`;

await c.execute(
  `INSERT INTO admin_users (id, email, password_hash) VALUES (?,?,?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  [randomUUID(), email.toLowerCase(), hash]
);

const [[row]] = await c.query("SELECT id, email, created_at FROM admin_users WHERE email = ?", [email.toLowerCase()]);
console.log(`Admin ready: ${row.email}`);
console.log("Sign in at /admin");
await c.end();
