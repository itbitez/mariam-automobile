import fs from "node:fs/promises";
import { q1, exec } from "@/lib/db";
import { ok, fail, guard } from "@/lib/api";
import { resolveUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export const DELETE = guard(async (_req, ctx) => {
  const { id } = await ctx.params;
  const row = await q1("SELECT filename FROM media WHERE id = ?", [id]);
  if (!row) return fail("Not found", 404);

  // Remove the catalogue row first. If the unlink fails (already gone, or a
  // permissions problem) the library should still stop showing a dead entry.
  await exec("DELETE FROM media WHERE id = ?", [id]);

  const full = resolveUpload(row.filename);
  if (full) await fs.unlink(full).catch(() => {});

  return ok({ deleted: id });
});
