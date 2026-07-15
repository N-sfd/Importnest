"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin/match-review";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace(nextPath.startsWith("/") ? nextPath : "/admin/match-review");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 max-w-md space-y-4 rounded-md border border-border bg-panel p-6 shadow-sm"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-cta px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-cta-hover disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Admin access only.{" "}
        <Link href="/" className="font-medium text-link hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <PageShell width="narrow">
      <h1 className="text-2xl font-bold text-foreground">Admin sign in</h1>
      <p className="mt-1 text-sm text-gray-600">
        Sign in to access match review and other operations tools.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-gray-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
