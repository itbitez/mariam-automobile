import AdminClient from "@/components/admin-client";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

/**
 * The panel is a client-side authenticated app — there is nothing meaningful to
 * prerender, and doing so pulled the Supabase client into the build step.
 */
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminClient />;
}
