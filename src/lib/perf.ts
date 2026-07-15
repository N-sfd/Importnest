/**
 * Minimal timing instrumentation for the search-intent flow's key
 * operations. Logs a single structured line per call — greppable, and
 * cheap enough to leave on in production — rather than pulling in a real
 * metrics/tracing pipeline this project doesn't have yet.
 */
export async function timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    console.info(`[perf] ${label} ${(performance.now() - start).toFixed(1)}ms`);
  }
}

export function timeSync<T>(label: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    console.info(`[perf] ${label} ${(performance.now() - start).toFixed(1)}ms`);
  }
}
