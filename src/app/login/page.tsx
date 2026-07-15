import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <PageShell width="narrow">
      <h1 className="text-2xl font-bold text-foreground">Sign in to Importnest</h1>
      <p className="mt-1 text-sm text-gray-600">
        Save products and set price alerts, or sign in to access operations tools.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-gray-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
