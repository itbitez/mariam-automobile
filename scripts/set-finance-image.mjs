/**
 * Optimises a source image into public/img/finance-mockup.webp and points the
 * calculator section at it.
 *
 *   node scripts/set-finance-image.mjs <path-to-image>
 *
 * With no argument it looks for a likely candidate in public/img and the usual
 * download folders.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_NAME = "finance-mockup.webp";
const OUT = path.join(ROOT, "public/img", OUT_NAME);

function findCandidate() {
  const dirs = [
    path.join(ROOT, "public/img"),
    path.join(os.homedir(), "Downloads"),
    path.join(os.homedir(), "Desktop"),
    path.join(os.homedir(), "Pictures"),
  ];
  for (const d of dirs) {
    if (!existsSync(d)) continue;
    const hit = readdirSync(d)
      .filter((f) => /^finance-mockup\.(png|jpe?g|webp)$/i.test(f))
      .map((f) => path.join(d, f))[0];
    if (hit) return hit;
  }
  return null;
}

const src = process.argv[2] || findCandidate();

if (!src || !existsSync(src)) {
  console.error("No source image found.");
  console.error("");
  console.error("Save the mockup as:");
  console.error("  " + path.join(ROOT, "public/img/finance-mockup.png"));
  console.error("");
  console.error("...or pass a path:  node scripts/set-finance-image.mjs \"C:/path/to/image.png\"");
  process.exit(1);
}

const meta = await sharp(src).metadata();
console.log("Source: " + src);
console.log("        " + meta.width + "x" + meta.height + " " + meta.format + "  " + Math.round(statSync(src).size / 1024) + " KB");

// 1600px wide is plenty — the panel is never rendered above ~700 CSS px, and
// next/image downsizes per device from this master anyway.
await sharp(src)
  .resize({ width: Math.min(1600, meta.width), withoutEnlargement: true })
  .webp({ quality: 86, effort: 6 })
  .toFile(OUT);

const outMeta = await sharp(OUT).metadata();
console.log("Wrote:  public/img/" + OUT_NAME);
console.log("        " + outMeta.width + "x" + outMeta.height + "  " + Math.round(statSync(OUT).size / 1024) + " KB");

// Point the homepage at it.
const pagePath = path.join(ROOT, "app/page.jsx");
let page = readFileSync(pagePath, "utf8");
const before = page;
page = page.replace(/finance: "\/img\/[^"]+"/, 'finance: "/img/' + OUT_NAME + '"');
if (page !== before) {
  writeFileSync(pagePath, page);
  console.log("Updated app/page.jsx -> IMG.finance = /img/" + OUT_NAME);
} else {
  console.log("app/page.jsx already points at " + OUT_NAME);
}

console.log("");
console.log("Now run:  npm run build   (then  npm run package  to rebuild the upload zip)");
