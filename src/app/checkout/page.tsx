import { CheckoutClient } from "@/components/CheckoutClient";
import { PageShell } from "@/components/PageShell";
import { getAuthUser } from "@/lib/auth";

export default async function CheckoutPage() {
  const authUser = await getAuthUser();

  return (
    <PageShell width="narrow">
      <CheckoutClient defaultEmail={authUser?.email ?? ""} />
    </PageShell>
  );
}
