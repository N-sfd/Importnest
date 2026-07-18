import { notFound } from "next/navigation";
import { getAuthUser, isAppUserAdmin } from "@/lib/auth";

/**
 * Second, independent authorization check for every /admin/* route — proxy
 * (src/proxy.ts) already redirects non-admins away, but Server Functions and
 * page renders aren't guaranteed to go through the proxy matcher, so this
 * layout re-verifies isAdmin rather than trusting proxy alone.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user || !(await isAppUserAdmin(user.id))) {
    notFound();
  }

  return children;
}
