import { exec } from "@/lib/db";
import { ok, fail, guard, readBody, str } from "@/lib/api";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "contacted", "closed"];

export const PATCH = guard(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await readBody(req);
  const status = str(body.status, 30);
  if (!STATUSES.includes(status)) return fail("Unknown status", 400);

  const r = await exec("UPDATE leads SET status = ? WHERE id = ?", [status, id]);
  if (!r.affectedRows) return fail("Lead not found", 404);
  return ok({ id, status });
});

export const DELETE = guard(async (_req, ctx) => {
  const { id } = await ctx.params;
  const r = await exec("DELETE FROM leads WHERE id = ?", [id]);
  if (!r.affectedRows) return fail("Lead not found", 404);
  return ok({ deleted: id });
});
