import { exec } from "@/lib/db";
import { ok, fail, guard, readBody, str, num } from "@/lib/api";

export const dynamic = "force-dynamic";

export const PATCH = guard(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await readBody(req);

  const sets = [];
  const args = [];
  if (body.caption !== undefined) {
    sets.push("caption = ?");
    args.push(str(body.caption, 255));
  }
  if (body.sortOrder !== undefined || body.sort_order !== undefined) {
    sets.push("sort_order = ?");
    args.push(num(body.sortOrder ?? body.sort_order, 0));
  }
  if (!sets.length) return fail("Nothing to update", 400);

  args.push(id);
  const r = await exec(`UPDATE happy_customers SET ${sets.join(", ")} WHERE id = ?`, args);
  if (!r.affectedRows) return fail("Photo not found", 404);
  return ok({ id });
});

export const DELETE = guard(async (_req, ctx) => {
  const { id } = await ctx.params;
  const r = await exec("DELETE FROM happy_customers WHERE id = ?", [id]);
  if (!r.affectedRows) return fail("Photo not found", 404);
  return ok({ deleted: id });
});
