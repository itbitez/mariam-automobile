import { exec } from "@/lib/db";
import { ok, fail, guard } from "@/lib/api";

export const dynamic = "force-dynamic";

export const DELETE = guard(async (_req, ctx) => {
  const { id } = await ctx.params;
  const r = await exec("DELETE FROM cars WHERE id = ?", [id]);
  if (!r.affectedRows) return fail("Car not found", 404);
  return ok({ deleted: id });
});
