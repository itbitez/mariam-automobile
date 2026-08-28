/**
 * Regenerates lib/data/site-images.json — the manifest the admin Media Library
 * uses for the "Site images" tab.
 *
 * Run after adding or removing anything in public/img:
 *   node scripts/build-site-images.mjs
 */
import { readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = path.join(ROOT, "public/img");

const imgKeys = JSON.parse(readFileSync(path.join(ROOT, "lib/data/img-keys.json"), "utf8"));
const pageImages = JSON.parse(readFileSync(path.join(ROOT, "lib/data/page-images.json"), "utf8"));

// Friendly names for files the site references directly.
const NAMED = {
  "hero-showroom.webp": "Homepage hero background",
  "finance-car.webp": "Finance section photo",
  "why-showroom.webp": "Why-choose-us backdrop",
  "logo-light.webp": "Logo — light version",
  "logo-dark.webp": "Logo — dark version",
  "logo-footer.webp": "Logo — footer",
};

const ROLE_LABEL = {
  heroMedia: "Homepage hero background",
  carBody: "Journey car body",
  rimRear: "Journey rear wheel",
  rimFront: "Journey front wheel",
  finVisual: "Finance section photo",
  ctaBg: "Call-to-action background",
  logoLight: "Logo — light version",
  logoDark: "Logo — dark version",
  logoFooter: "Logo — footer",
  interior: "Car interior",
  chr_white: "C-HR white",
  yaris: "Yaris Cross",
  cross_wet: "Corolla Cross (wet)",
  chr_red: "C-HR red wine",
  cross_show: "Corolla Cross (showroom)",
  c1: "Car photo 1",
  c2: "Car photo 2",
  c3: "Car photo 3",
  c4: "Car photo 4",
  c5: "Car photo 5",
  c6: "Car photo 6",
};

const labels = { ...NAMED };
const addLabel = (url, role) => {
  if (!url) return;
  const file = url.split("/").pop();
  if (!labels[file]) labels[file] = ROLE_LABEL[role] || role;
};

Object.entries(imgKeys).forEach(([k, v]) => addLabel(v, k));
Object.values(pageImages).forEach((page) => Object.entries(page).forEach(([k, v]) => addLabel(v, k)));

const files = readdirSync(IMG_DIR)
  .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
  .sort();

const out = [];
for (const f of files) {
  const full = path.join(IMG_DIR, f);
  let width = null;
  let height = null;
  try {
    const m = await sharp(full).metadata();
    width = m.width;
    height = m.height;
  } catch {
    /* non-fatal — dimensions stay null */
  }
  out.push({
    url: "/img/" + f,
    name: f,
    label: labels[f] || "Site image",
    size: statSync(full).size,
    width,
    height,
  });
}

// Labelled images (actually used on the site) first.
out.sort((a, b) => {
  const la = a.label === "Site image" ? 1 : 0;
  const lb = b.label === "Site image" ? 1 : 0;
  if (la !== lb) return la - lb;
  return a.label.localeCompare(b.label);
});

writeFileSync(path.join(ROOT, "lib/data/site-images.json"), JSON.stringify(out, null, 2) + "\n");
console.log("Wrote " + out.length + " entries to lib/data/site-images.json");
for (const o of out) console.log("  " + o.name.padEnd(26) + o.label);
