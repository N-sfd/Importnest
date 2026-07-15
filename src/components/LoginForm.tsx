"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/saved";

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "sign-up") {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (!data.session) {
          // Email confirmation is required before a session exists.
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("sign-in");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          return;
        }
      }

      router.replace(nextPath.startsWith("/") ? nextPath : "/saved");
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
      <div className="flex gap-1 rounded-full bg-surface p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
            setInfo(null);
          }}
          aria-pressed={mode === "sign-in"}
          className={`flex-1 rounded-full px-3 py-1.5 font-semibold transition ${
            mode === "sign-in" ? "bg-cta text-navy-900" : "text-muted hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
            setInfo(null);
          }}
          aria-pressed={mode === "sign-up"}
          className={`flex-1 rounded-full px-3 py-1.5 font-semibold transition ${
            mode === "sign-up" ? "bg-cta text-navy-900" : "text-muted hover:text-foreground"
          }`}
        >
          Create account
        </button>
      </div>

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
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {info && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{info}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-cta w-full px-4 py-2.5 text-sm disabled:opacity-60"
      >
        {loading
          ? mode === "sign-up"
            ? "Creating account…"
            : "Signing in…"
          : mode === "sign-up"
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="text-center text-xs text-gray-500">
        <Link href="/" className="font-medium text-link hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}
