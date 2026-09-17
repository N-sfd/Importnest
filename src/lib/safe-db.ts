/**
 * Shared helpers for graceful degradation when Postgres/Supabase is unreachable.
 * Pages should prefer empty/demo UI over error.tsx.
 */

export function isDbUnavailableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? String(err.name) : "";
  const message = "message" in err ? String(err.message) : "";
  return (
    name === "PrismaClientInitializationError" ||
    name === "PrismaClientKnownRequestError" ||
    name === "PrismaClientRustPanicError" ||
    /ENOTFOUND|ECONNREFUSED|Can't reach database|tenant\/user|Timed out/i.test(message)
  );
}

/** Next.js `redirect()` / `notFound()` throw special errors — never swallow them. */
export function rethrowIfNextControlFlow(err: unknown): void {
  if (!err || typeof err !== "object") return;
  const digest = "digest" in err ? String(err.digest) : "";
  if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) {
    throw err;
  }
  const message = "message" in err ? String(err.message) : "";
  if (message === "NEXT_REDIRECT" || message === "NEXT_NOT_FOUND") {
    throw err;
  }
}

/** Run a DB-backed loader; on failure log and return `fallback`. */
export async function withDbFallback<T>(
  label: string,
  fallback: T,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    rethrowIfNextControlFlow(err);
    console.error(`[db] ${label} unavailable`, err);
    return fallback;
  }
}
