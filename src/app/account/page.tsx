import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { PageShell } from "@/components/PageShell";
import { getAuthUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/account");

  return (
    <PageShell width="narrow">
      <h1 className="text-xl font-bold tracking-tight text-navy-900">Account</h1>

      <section className="panel mt-4 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Signed in as</p>
        <p className="mt-1 text-base font-semibold text-navy-900">{user.email}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/saved"
            className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800"
          >
            Saved products & alerts
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-navy-900 hover:border-navy-800"
          >
            Cart
          </Link>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <LogoutButton />
        </div>
      </section>
    </PageShell>
  );
}
