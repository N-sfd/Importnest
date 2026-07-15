import { afterEach, describe, expect, it, vi } from "vitest";
import { extractIntentWithAI } from "@/lib/ai-search-intent";

describe("extractIntentWithAI — deterministic fallback", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it("returns null immediately when no API key is configured (no network call)", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const result = await extractIntentWithAI("a backpack for college under $100");
    expect(result).toBeNull();
  });

  it("never throws even when the API call fails (invalid key)", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-invalid-test-key-00000000000000000000000000";
    await expect(extractIntentWithAI("a backpack for college")).resolves.toBeNull();
  });
});

describe("extractIntentWithAI — console noise", () => {
  it("logs a warning (not an error/throw) on failure so it doesn't look like a crash", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.ANTHROPIC_API_KEY = "sk-ant-invalid-test-key-00000000000000000000000000";
    await extractIntentWithAI("test query");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
    delete process.env.ANTHROPIC_API_KEY;
  });
});
