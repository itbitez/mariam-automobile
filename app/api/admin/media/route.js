import fs from "node:fs/promises";
import path from "node:path";
import { q, exec } from "@/lib/db";
import { ok, fail, guard } from "@/lib/api";
import { newId } from "@/lib/auth";
import { uploadDir, safeName, ALLOWED, MAX_BYTES } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/**
 * Replaces the Supabase Storage bucket.
 *
 * Storage could list a bucket's objects directly; a filesystem behind a Node
 * process cannot be listed safely from the browser, so every upload is
 * catalogued in the `media` table and the library reads that instead.
 */

export const GET = guard(async () => {
  const rows = await q("SELECT id, filename, url, mime, size_bytes, created_at FROM media ORDER BY created_at DESC LIMIT 500");
  return ok({ media: rows });
});

export const POST = guard(async (req) => {
  const form = await req.formData().catch(() => null);
  if (!form) return fail("Expected multipart form data", 400);

  const files = form.getAll("file").filter((f) => typeof f === "object" && f.size !== undefined);
  if (!files.length) return fail("No file uploaded", 400);

  const dir = uploadDir();
  const saved = [];
  const skipped = [];

  for (const file of files) {
    if (!ALLOWED[file.type]) {
      skipped.push(`${file.name}: unsupported type ${file.type || "unknown"}`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      skipped.push(`${file.name}: over 5 MB`);
      continue;
    }

    const filename = safeName(file.name, file.type);
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), buf);

    const url = `/api/uploads/${filename}`;
    const id = newId();
    await exec(
      "INSERT INTO media (id, filename, url, mime, size_bytes) VALUES (?,?,?,?,?)",
      [id, filename, url, file.type, buf.length]
    );
    saved.push({ id, filename, url, mime: file.type, size_bytes: buf.length });
  }

  if (!saved.length) return fail(skipped.join("; ") || "Nothing uploaded", 400);
  return ok({ media: saved, skipped });
});
