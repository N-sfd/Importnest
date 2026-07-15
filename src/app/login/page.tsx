import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <PageShell width="narrow">
      <h1 className="text-2xl font-bold text-foreground">Sign in to Importnest</h1>
      <p className="mt-1 max-w-md text-sm text-muted">
        Sign in to track price drops and organize your shopping lists.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
