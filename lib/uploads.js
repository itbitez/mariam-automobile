import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Where uploaded images live.
 *
 * Deliberately NOT inside public/ or anywhere under the app directory. You
 * deploy by replacing that directory, so anything stored there is destroyed on
 * every release — which is how sites silently lose their customer photos.
 *
 * Default is a sibling of the project ("../mariam-uploads"). Override with
 * UPLOAD_DIR in .env.local / hPanel to point at a path you know survives a
 * deploy. Files are served by /api/uploads/[...path], never by the static
 * handler, because Next only serves static files from public/.
 */
export function uploadDir() {
  const configured = process.env.UPLOAD_DIR;
  const dir = configured ? path.resolve(configured) : path.resolve(process.cwd(), "..", "mariam-uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export const ALLOWED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Builds a safe on-disk name. The stored name is what the URL exposes, so it
 * must not contain path separators or traversal sequences.
 */
export function safeName(original, mime) {
  const ext = ALLOWED[mime] || path.extname(original || "").toLowerCase() || ".bin";
  const stem = path
    .basename(original || "upload", path.extname(original || ""))
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "upload";
  const unique = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  return `${unique}-${stem}${ext}`;
}

/**
 * Resolves a requested filename to a real path inside uploadDir, or null.
 * Rejects anything that escapes the directory — the whole point of this check.
 */
export function resolveUpload(name) {
  if (!name || name.includes("\0")) return null;
  const dir = uploadDir();
  const full = path.resolve(dir, name);
  const rel = path.relative(dir, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

export const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};
