import { describe, expect, it } from "vitest";
import { ProviderError } from "@/lib/providers/errors";

describe("ProviderError", () => {
  it("prefixes the message with the provider name", () => {
    const error = new ProviderError("resend", "invalid API key");
    expect(error.message).toBe("[resend] invalid API key");
    expect(error.name).toBe("ProviderError");
    expect(error).toBeInstanceOf(Error);
  });

  it("is not retryable unless stated", () => {
    expect(new ProviderError("r2", "denied").retryable).toBe(false);
    expect(new ProviderError("r2", "timeout", { retryable: true }).retryable).toBe(true);
  });

  it("keeps the original error as the cause", () => {
    const cause = new Error("socket hang up");
    expect(new ProviderError("razorpay", "request failed", { cause }).cause).toBe(cause);
  });
});
