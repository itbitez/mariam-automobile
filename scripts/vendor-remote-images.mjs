/**
 * Downloads the remote page-header images into public/img and converts them to
 * WebP.
 *
 *   npm run images:vendor
 *
 * They were plain <img src="https://images.unsplash.com/..."> tags, so every
 * visitor fetched 1.2 MB straight from a third-party CDN with no optimisation
 * and no fallback. If that CDN is slow, throttled or blocked — which it can be
 * depending on the network — the page header simply has no image.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("public/img");
fs.mkdirSync(OUT, { recursive: true });

const IMAGES = [
  {
    name: "head-cars.webp",
    url: "https://images.unsplash.com/photo-1761738217531-44a249d1dc87?fm=jpg&q=80&w=2200&auto=format&fit=crop",
  },
  {
    name: "head-detail.webp",
    url: "https://images.unsplash.com/photo-1565376901308-37344a4b06ea?fm=jpg&q=80&w=2200&auto=format&fit=crop",
  },
];

for (const img of IMAGES) {
  const dest = path.join(OUT, img.name);
  process.stdout.write(`${img.name.padEnd(20)}`);
  try {
    const res = await fetch(img.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    // The header is a wide band and crops with object-fit: cover, so a tall
    // source is bytes the visitor downloads and never sees. Crop to 1920x900
    // up front — attention-based cropping keeps the car in frame.
    const out = await sharp(buf)
      .resize({ width: 1920, height: 900, fit: "cover", position: sharp.strategy.attention, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toBuffer();
    fs.writeFileSync(dest, out);

    const meta = await sharp(out).metadata();
    console.log(`${meta.width}x${meta.height}  ${Math.round(buf.length / 1024)}KB -> ${Math.round(out.length / 1024)}KB`);
  } catch (e) {
    console.log(`FAILED — ${e.message}`);
    process.exitCode = 1;
  }
}
