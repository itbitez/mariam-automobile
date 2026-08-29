import { q } from "@/lib/db";
import { ok, guard } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET — enquiry submissions.
 *
 * Under Supabase this was "leads admin read" RLS: the public could insert but
 * only a signed-in admin could select. guard() is now the equivalent, and the
 * public insert lives in /api/lead (unauthenticated, deliberately).
 */
export const GET = guard(async () => {
  const rows = await q("SELECT * FROM leads ORDER BY created_at DESC LIMIT 500");
  return ok({ leads: rows });
});
