import { describe, expect, it } from "vitest";
import { validatePublicEnv } from "./validate-public-env";

const configured = {
  VITE_CLERK_PUBLISHABLE_KEY: "test-only-clerk-value",
  VITE_SUPABASE_URL: "https://example.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "test-only-supabase-value",
};

describe("public build configuration", () => {
  it("accepts the required configuration without optional integrations", () => {
    expect(() => validatePublicEnv(configured)).not.toThrow();
  });

  it.each(Object.keys(configured))("rejects a missing %s", (name) => {
    expect(() => validatePublicEnv({ ...configured, [name]: undefined })).toThrow(name);
  });

  it("rejects whitespace-only values", () => {
    expect(() => validatePublicEnv({ ...configured, VITE_CLERK_PUBLISHABLE_KEY: "  " }))
      .toThrow("VITE_CLERK_PUBLISHABLE_KEY");
  });

  it("reports all missing names without disclosing configured values", () => {
    try {
      validatePublicEnv({ VITE_SUPABASE_PUBLISHABLE_KEY: "do-not-log-this-value" });
      throw new Error("Expected validation to fail");
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain("VITE_CLERK_PUBLISHABLE_KEY");
      expect(message).toContain("VITE_SUPABASE_URL");
      expect(message).not.toContain("do-not-log-this-value");
    }
  });
});
