import { q, exec } from "@/lib/db";
import { ok, guard, readBody, str, num } from "@/lib/api";
import { newId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = guard(async () => {
  const rows = await q("SELECT * FROM happy_customers ORDER BY sort_order ASC, created_at DESC");
  return ok({ rows });
});

/** POST — append one or more photos to the end of the gallery. */
export const POST = guard(async (req) => {
  const body = await readBody(req);
  const urls = (Array.isArray(body.urls) ? body.urls : [body.url]).filter(Boolean).map((u) => str(u, 500));
  if (!urls.length) return ok({ rows: [] });

  const [{ maxOrder }] = await q(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS maxOrder FROM happy_customers"
  );
  const base = num(maxOrder, 0);

  const created = [];
  for (let i = 0; i < urls.length; i++) {
    const id = newId();
    await exec("INSERT INTO happy_customers (id, image_url, caption, sort_order) VALUES (?,?,?,?)", [
      id,
      urls[i],
      "",
      base + i,
    ]);
    created.push(id);
  }

  const rows = await q(
    `SELECT * FROM happy_customers WHERE id IN (${created.map(() => "?").join(",")})
     ORDER BY sort_order ASC`,
    created
  );
  return ok({ rows });
});
