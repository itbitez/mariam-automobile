/**
 * Builds mariam-automobile-deploy.zip — the archive to upload in
 * hPanel → Websites → Add Website → Deploy Web App → Upload your website files.
 *
 * Only source is included. Hostinger runs `npm install` and `npm run build`
 * itself, so shipping node_modules or .next would just bloat the upload.
 *
 * Usage: npm run package
 */
import { existsSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "mariam-automobile-deploy.zip");

// Everything the app needs to build and run on the server.
const INCLUDE = [
  "app",
  "components",
  "lib",
  "public",
  "package.json",
  "package-lock.json",
  "next.config.mjs",
  "jsconfig.json",
];

// Useful to have alongside, but not required at runtime.
const OPTIONAL = ["mysql", "DEPLOY.md", ".env.example"];

function human(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

/**
 * Windows PowerShell's Compress-Archive writes backslash path separators, which
 * Linux unzip (i.e. Hostinger's build server) mangles into filenames like
 * "app\page.jsx". bsdtar, shipped in System32 since Windows 10, writes a
 * portable archive — so use that instead.
 */
function zipCommand(items) {
  if (process.platform !== "win32") {
    return { cmd: "zip", args: ["-r", "-q", OUT, ...items] };
  }
  const bsdtar = "C:\\Windows\\System32\\tar.exe";
  return {
    cmd: existsSync(bsdtar) ? bsdtar : "tar",
    args: ["-a", "-c", "-f", OUT, ...items],
  };
}

const missing = INCLUDE.filter((f) => !existsSync(path.join(ROOT, f)));
if (missing.length) {
  console.error("Missing required paths: " + missing.join(", "));
  process.exit(1);
}

const items = [...INCLUDE, ...OPTIONAL.filter((f) => existsSync(path.join(ROOT, f)))];

if (existsSync(OUT)) rmSync(OUT);

const { cmd, args } = zipCommand(items);
execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT });

console.log("");
console.log("Created " + path.basename(OUT) + "  (" + human(statSync(OUT).size) + ")");
console.log("");
console.log("Included:");
for (const i of items) console.log("  - " + i);
console.log("");
console.log("Excluded on purpose: node_modules, .next, .env.local, legacy/, clean/");
console.log("");
console.log("Next: upload it in hPanel and set the environment variables.");
console.log("See DEPLOY.md for the full walkthrough.");
