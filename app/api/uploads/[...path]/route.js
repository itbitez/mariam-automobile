import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { resolveUpload, CONTENT_TYPES } from "@/lib/uploads";

/**
 * Serves uploaded images.
 *
 * Uploads live outside the app directory so a redeploy cannot delete them,
 * which also puts them outside public/ — Next's static handler will not serve
 * them, so this route does.
 *
 * Public on purpose: these are the photos on the website. Only the filenames
 * recorded in the `media` table are reachable, and resolveUpload rejects any
 * path that escapes the upload directory.
 */
export async function GET(_req, ctx) {
  const { path: parts } = await ctx.params;
  const name = Array.isArray(parts) ? parts.join("/") : String(parts || "");

  const full = resolveUpload(name);
  if (!full) return new Response("Not found", { status: 404 });

  let stat;
  try {
    stat = await fsp.stat(full);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!stat.isFile()) return new Response("Not found", { status: 404 });

  const type = CONTENT_TYPES[path.extname(full).toLowerCase()] || "application/octet-stream";

  return new Response(fs.createReadStream(full), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(stat.size),
      // Filenames carry a unique prefix and are never reused, so these are
      // safe to cache hard.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
